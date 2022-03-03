﻿// Copyright (C) 2020-2021 grappigegovert <grappigegovert@hotmail.com>
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
	public class MemoryPatcher
	{
		public static bool Patch(Process process, Options patchOptions)
		{
			IntPtr hProcess = Pinvoke.OpenProcess(
				  ProcessAccess.PROCESS_VM_READ
				| ProcessAccess.PROCESS_VM_WRITE
				| ProcessAccess.PROCESS_VM_OPERATION,
				false, process.Id);

			if (hProcess == IntPtr.Zero)
			{
				throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to get a process handle.");
			}

			try
			{
				ProcessModule mainModule = process.MainModule;
				if (mainModule == null)
				{
					return false; // process has no main module (not initialized yet?), try again next timer tick.
				}

				IntPtr b = mainModule.BaseAddress;
				uint timestamp = getTimestamp(hProcess, b);
				HitmanVersion v = HitmanVersion.getVersion(timestamp, patchOptions.ForcedVersion);
				if (v == HitmanVersion.NotFound)
				{
					if (AOBScanner.TryGetHitmanVersionByScanning(process, hProcess, out v))
					{
						// add it to the db so subsequent patches don't need searching again
						HitmanVersion.addVersion(timestamp.ToString("X8"), timestamp, v);
					}
					else
					{
						throw new NotImplementedException();
					}
				}
				UIntPtr byteswritten;
				MemProtection oldprotectflags = 0;
				byte[] newurl = Encoding.ASCII.GetBytes(patchOptions.CustomConfigDomain).Concat(new byte[] { 0x00 }).ToArray();
				List<Patch> patches = new List<Patch>();

				if (!IsReadyForPatching(hProcess, b, v))
				{
					// Online_ConfigDomain variable is not initialized yet, try again in 1 second.
					Pinvoke.CloseHandle(hProcess);
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
					MemProtection newmemprotection;

					switch (patch.defaultProtection)
					{
						case MemProtection.PAGE_EXECUTE_READ:
						case MemProtection.PAGE_EXECUTE_READWRITE:
							newmemprotection = MemProtection.PAGE_EXECUTE_READWRITE;
							break;
						case MemProtection.PAGE_READONLY:
						case MemProtection.PAGE_READWRITE:
							newmemprotection = MemProtection.PAGE_READWRITE;
							break;
						default:
							throw new Exception("This shouldn't be able to happen.");
					}

					if (!Pinvoke.VirtualProtectEx(hProcess, b + patch.offset, (UIntPtr)dataToWrite.Length,
						newmemprotection, out oldprotectflags))
					{
						throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "vpe1", patch.offset));
					}

					if (!Pinvoke.WriteProcessMemory(hProcess, b + patch.offset, dataToWrite, (UIntPtr)dataToWrite.Length, out byteswritten))
					{
						throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}"
							+ "\nBytes written: {2}", "wpm", patch.offset, byteswritten));
					}

					MemProtection protectionToRestore = oldprotectflags;

					if (!Pinvoke.VirtualProtectEx(hProcess, b + patch.offset, (UIntPtr)dataToWrite.Length,
						protectionToRestore, out oldprotectflags))
					{
						throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at {0} for offset {1:X}", "vpe2", patch.offset));
					}
				}
			}
			finally
			{
				Pinvoke.CloseHandle(hProcess);
			}

			return true;
		}

		private static bool IsReadyForPatching(IntPtr hProcess, IntPtr baseAddress, HitmanVersion version)
		{
			byte[] buffer = { 0 };
			UIntPtr bytesread;
			bool ready = true;
			MemProtection newmemprotection = MemProtection.PAGE_READWRITE;
			// It should already be READWRITE, but this is to remove possible PAGE_GUARD temporarily
			foreach (Patch p in version.configdomain.Where(p => p.customPatch == "configdomain"))
			{
				MemProtection oldprotectflags;
				if (!Pinvoke.VirtualProtectEx(hProcess, baseAddress + p.offset, (UIntPtr)p.patch.Length, newmemprotection, out oldprotectflags))
				{
					throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at vpe1Check for offset {0:X}", p.offset));
				}
				if (!Pinvoke.ReadProcessMemory(hProcess, baseAddress + p.offset, buffer, (UIntPtr)1, out bytesread))
				{
					throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at rpmCheck for offset {0:X}", p.offset));
				}
				if (!Pinvoke.VirtualProtectEx(hProcess, baseAddress + p.offset, (UIntPtr)p.patch.Length, oldprotectflags, out oldprotectflags))
				{
					throw new Win32Exception(Marshal.GetLastWin32Error(), string.Format("error at vpe2Check for offset {0:X}", p.offset));
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
			Pinvoke.ReadProcessMemory(hProcess, baseAddress + 0x3C, buffer, (UIntPtr)4, out bytesread);
			int NTHeaderOffset = BitConverter.ToInt32(buffer, 0);
			Pinvoke.ReadProcessMemory(hProcess, baseAddress + NTHeaderOffset + 0x8, buffer, (UIntPtr)4, out bytesread);
			return BitConverter.ToUInt32(buffer, 0);
		}
	}
}
