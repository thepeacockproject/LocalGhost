﻿// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace Hitman2Patcher
{
	// from https://docs.microsoft.com/en-us/windows/win32/memory/memory-protection-constants
	public enum MemProtection
	{
		PAGE_EXECUTE = 0x00000010,
		PAGE_EXECUTE_READ = 0x00000020,
		PAGE_EXECUTE_READWRITE = 0x00000040,
		PAGE_EXECUTE_WRITECOPY = 0x00000080,
		PAGE_NOACCESS = 0x00000001,
		PAGE_READONLY = 0x00000002,
		PAGE_READWRITE = 0x00000004
	}

	public class MemoryPatcher
	{
		[DllImport("kernel32", SetLastError = true)]
		private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, int dwProcessId);

		[DllImport("kernel32", SetLastError = true)]
		private static extern bool CloseHandle(IntPtr hObject);

		[DllImport("kernel32")]
		private static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr address, byte[] buffer, uint size, out int byteswritten);

		[DllImport("kernel32.dll", SetLastError = true)]
		static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr address, [Out] byte[] buffer, uint size, out int numberOfBytesRead);

		[DllImport("kernel32.dll")]
		static extern bool VirtualProtectEx(IntPtr hProcess, IntPtr lpAddress, uint dwSize, MemProtection flNewProtect, out uint lpflOldProtect);

		private const uint PROCESS_VM_READ = 0x0010; //Required to read memory in a process using ReadProcessMemory.
		private const uint PROCESS_VM_WRITE = 0x0020; // Required to write to memory in a process using WriteProcessMemory.
		private const uint PROCESS_VM_OPERATION = 0x0008; // Required to perform an operation on the address space of a process using VirtualProtectEx

		public static bool Patch(Process process, Options patchOptions)
		{
			IntPtr hProcess = OpenProcess(PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_VM_OPERATION,
				false, process.Id);
			IntPtr b = process.MainModule.BaseAddress;
			Hitman2Version v = Hitman2Version.getVersion(getTimestamp(hProcess, b), patchOptions.ForcedVersion);
			int byteswritten;
			uint oldprotectflags;
			byte[] newurl = Encoding.ASCII.GetBytes(patchOptions.CustomConfigDomain).Concat(new byte[] { 0x00 }).ToArray();
			List<Patch> patches = new List<Patch>();

			if (!IsReadyForPatching(hProcess, b, v, process.Id))
			{
				CloseHandle(hProcess);
				return false;
			}

			if (patchOptions.DisableCertPinning)
			{
				patches.AddRange(v.certpin);
			}
			if (patchOptions.AlwaysSendAuthHeader)
			{
				patches.AddRange(v.authheader);
			}
			if (patchOptions.SetCustomConfigDomain)
			{
				patches.AddRange(v.configdomain);
			}
			if (patchOptions.UseHttp)
			{
				patches.AddRange(v.protocol);
			}
			if (patchOptions.DisableForceOfflineOnFailedDynamicResources)
			{
				patches.AddRange(v.dynres_noforceoffline);
			}

			foreach (Patch patch in patches)
			{
				byte[] dataToWrite = patch.patch;
				if (patch.customPatch == "configdomain")
				{
					dataToWrite = newurl;
				}
				MemProtection newmemprotection = MemProtection.PAGE_READWRITE;
				bool patchmemprotection = true;

				if (patch.defaultProtection == MemProtection.PAGE_EXECUTE_READ)
				{
					newmemprotection = MemProtection.PAGE_EXECUTE_READWRITE;
				}
				else if (patch.defaultProtection == MemProtection.PAGE_READONLY)
				{
					newmemprotection = MemProtection.PAGE_READWRITE;
				}
				else
				{
					patchmemprotection = false;
				}

				if (patchmemprotection && !VirtualProtectEx(hProcess, b + patch.offset, (uint)dataToWrite.Length,
						newmemprotection, out oldprotectflags))
				{
					CloseHandle(hProcess);
					throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "vpe1", patch.offset));
				}

				if (!WriteProcessMemory(hProcess, b + patch.offset, dataToWrite, (uint)dataToWrite.Length, out byteswritten))
				{
					CloseHandle(hProcess);
					throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "wpm", patch.offset));
				}

				if (patchmemprotection && !VirtualProtectEx(hProcess, b + patch.offset, (uint)dataToWrite.Length,
						patch.defaultProtection, out oldprotectflags))
				{
					CloseHandle(hProcess);
					throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "vpe2", patch.offset));
				}
			}

			CloseHandle(hProcess);
			return true;
		}

		public static Dictionary<int, int> patchTries = new Dictionary<int, int>();

		private static bool IsReadyForPatching(IntPtr hProcess, IntPtr baseAddress, Hitman2Version version, int processId)
		{
			byte[] buffer = { 0 };
			int bytesread;
			bool ready = true;
			foreach (Patch p in version.configdomain.Where(p => p.customPatch == "configdomain"))
			{
				if (!ReadProcessMemory(hProcess, baseAddress + p.offset, buffer, 1, out bytesread))
				{
					int tries = patchTries.GetValueOrDefault(processId);
					if (tries >= 3) // throw if this fails 3 times
					{
						CloseHandle(hProcess);
						throw new Win32Exception(Marshal.GetLastWin32Error());
					}
					patchTries[processId] = tries + 1;
				}
				ready &= buffer[0] != 0;
			}
			return ready;
		}

		public struct Options
		{
			public bool DisableCertPinning;
			public bool AlwaysSendAuthHeader;
			public bool SetCustomConfigDomain;
			public string CustomConfigDomain;
			public bool UseHttp;
			public bool DisableForceOfflineOnFailedDynamicResources;
			public string ForcedVersion;
		}

		public static UInt32 getTimestamp(IntPtr hProcess, IntPtr baseAddress)
		{
			byte[] buffer = new byte[4];
			int bytesread;
			ReadProcessMemory(hProcess, baseAddress + 0x3C, buffer, 4, out bytesread);
			int NTHeaderOffset = BitConverter.ToInt32(buffer, 0);
			ReadProcessMemory(hProcess, baseAddress + NTHeaderOffset + 0x8, buffer, 4, out bytesread);
			return BitConverter.ToUInt32(buffer, 0);
		}
	}

	public static class DictionaryExtentions
	{
		public static TValue GetValueOrDefault<TKey, TValue>(this Dictionary<TKey, TValue> dictionary, TKey key,
			TValue defaultValue = default(TValue))
		{
			TValue value;
			return dictionary.TryGetValue(key, out value) ? value : defaultValue;
		}
	}
}