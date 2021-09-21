// Copyright (C) 2020-2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace HitmanPatcher
{
	// from https://docs.microsoft.com/en-us/windows/win32/memory/memory-protection-constants
	// Not all, but I'm pretty sure these are the only types that will occur here.
	[Flags]
	public enum MemProtection : uint
	{
		PAGE_NOACCESS = 0x00000001,
		PAGE_READONLY = 0x00000002,
		PAGE_READWRITE = 0x00000004,
		PAGE_EXECUTE = 0x00000010,
		PAGE_EXECUTE_READ = 0x00000020,
		PAGE_EXECUTE_READWRITE = 0x00000040,
		PAGE_EXECUTE_WRITECOPY = 0x00000080,
		PAGE_GUARD = 0x00000100
	}

	public class MemoryPatcher
	{
		[DllImport("kernel32", SetLastError = true)]
		private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, int dwProcessId);

		[DllImport("kernel32", SetLastError = true)]
		private static extern bool CloseHandle(IntPtr hObject);

		[DllImport("kernel32.dll", SetLastError = true)]
		private static extern bool WriteProcessMemory([In] IntPtr hProcess, [In] IntPtr address, [In, MarshalAs(UnmanagedType.LPArray)] byte[] buffer, [In] UIntPtr size, [Out] out UIntPtr byteswritten);

		[DllImport("kernel32.dll", SetLastError = true)]
		private static extern bool ReadProcessMemory([In] IntPtr hProcess, [In] IntPtr address, [Out, MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 3)] byte[] buffer, [In] UIntPtr size, [Out] out UIntPtr numberOfBytesRead);

		[DllImport("kernel32.dll", SetLastError = true)]
		private static extern bool VirtualProtectEx([In] IntPtr hProcess, [In] IntPtr lpAddress, [In] UIntPtr dwSize, [In] MemProtection flNewProtect, [Out] out MemProtection lpflOldProtect);

		// from https://docs.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights
		private const uint PROCESS_VM_READ = 0x0010; // Required to read memory in a process using ReadProcessMemory.
		private const uint PROCESS_VM_WRITE = 0x0020; // Required to write to memory in a process using WriteProcessMemory.
		private const uint PROCESS_VM_OPERATION = 0x0008; // Required to perform an operation on the address space of a process using VirtualProtectEx

		public static bool Patch(Process process, Options patchOptions)
		{
			IntPtr hProcess = OpenProcess(PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_VM_OPERATION,
				false, process.Id);

			if (hProcess == IntPtr.Zero)
			{
				throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get a process handle.");
			}

			try
			{
				IntPtr b = process.MainModule.BaseAddress;
				HitmanVersion v = HitmanVersion.getVersion(getTimestamp(hProcess, b), patchOptions.ForcedVersion);
				UIntPtr byteswritten;
				MemProtection oldprotectflags = 0;
				byte[] newurl = Encoding.ASCII.GetBytes(patchOptions.CustomConfigDomain).Concat(new byte[] { 0x00 }).ToArray();
				List<Patch> patches = new List<Patch>();

				if (!IsReadyForPatching(hProcess, b, v))
				{
					// Online_ConfigDomain variable is not initialized yet, try again in 1 second.
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
						// page is already writable so it doesn't need patching
						patchmemprotection = false;
					}

					if (patchmemprotection && !VirtualProtectEx(hProcess, b + patch.offset, (UIntPtr)dataToWrite.Length,
						newmemprotection, out oldprotectflags))
					{
						throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "vpe1", patch.offset));
					}

					if (!WriteProcessMemory(hProcess, b + patch.offset, dataToWrite, (UIntPtr)dataToWrite.Length, out byteswritten))
					{
						throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}"
							+ "\nBytes written: {2}", "wpm", patch.offset, byteswritten));
					}

					MemProtection protectionToRestore = patch.defaultProtection;
					if (oldprotectflags.HasFlag(MemProtection.PAGE_GUARD)) // re-add page guard if it had it before
					{
						protectionToRestore |= MemProtection.PAGE_GUARD;
						patchmemprotection = true;
					}

					if (patchmemprotection && !VirtualProtectEx(hProcess, b + patch.offset, (UIntPtr)dataToWrite.Length,
						protectionToRestore, out oldprotectflags))
					{
						throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "vpe2", patch.offset));
					}
				}
			}
			finally
			{
				CloseHandle(hProcess);
			}

			return true;
		}

		private static bool IsReadyForPatching(IntPtr hProcess, IntPtr baseAddress, HitmanVersion version)
		{
			byte[] buffer = { 0 };
			UIntPtr bytesread;
			bool ready = true;
			foreach (Patch p in version.configdomain.Where(p => p.customPatch == "configdomain"))
			{
				if (!ReadProcessMemory(hProcess, baseAddress + p.offset, buffer, (UIntPtr)1, out bytesread))
				{
					throw new Win32Exception(Marshal.GetLastWin32Error());
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
			UIntPtr bytesread;
			ReadProcessMemory(hProcess, baseAddress + 0x3C, buffer, (UIntPtr)4, out bytesread);
			int NTHeaderOffset = BitConverter.ToInt32(buffer, 0);
			ReadProcessMemory(hProcess, baseAddress + NTHeaderOffset + 0x8, buffer, (UIntPtr)4, out bytesread);
			return BitConverter.ToUInt32(buffer, 0);
		}
	}
}
