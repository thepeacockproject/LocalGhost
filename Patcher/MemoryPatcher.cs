using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace Hitman2Patcher
{
	class MemoryPatcher
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
		static extern bool VirtualProtectEx(IntPtr hProcess, IntPtr lpAddress, uint dwSize, uint flNewProtect, out uint lpflOldProtect);

		private const uint PROCESS_VM_READ = 0x0010; //Required to read memory in a process using ReadProcessMemory.
		private const uint PROCESS_VM_WRITE = 0x0020; // Required to write to memory in a process using WriteProcessMemory.
		private const uint PROCESS_VM_OPERATION = 0x0008; // Required to perform an operation on the address space of a process using VirtualProtectEx
		private const uint PAGE_EXECUTE_READWRITE = 0x40;
		private const uint PAGE_READWRITE = 0x04;

		public static bool Patch(Process process, Options patchOptions)
		{
			IntPtr hProcess = OpenProcess(PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_VM_OPERATION, false, process.Id);
			Hitman2Version v = Hitman2Version.getVersion(process);
			IntPtr b = process.MainModule.BaseAddress;
			int byteswritten;
			uint oldprotectflags;
			byte[] newurl = Encoding.ASCII.GetBytes(patchOptions.CustomConfigDomain).Concat(new byte[] { 0x00 }).ToArray();
			byte[] http = Encoding.ASCII.GetBytes("http://{0}").Concat(new byte[] { 0x00 }).ToArray();
			bool success = true;

			if (!IsReadyForPatching(hProcess, b, v))
			{
				CloseHandle(hProcess);
				return false;
			}

			if (patchOptions.DisableCertPinning)
			{
				success &= VirtualProtectEx(hProcess, b + v.certpin, 1, PAGE_EXECUTE_READWRITE, out oldprotectflags);
				success &= WriteProcessMemory(hProcess, b + v.certpin, new byte[] { 0xEB }, 1, out byteswritten); // bypass cert pinning
			}
			if (patchOptions.AlwaysSendAuthHeader)
			{
				success &= VirtualProtectEx(hProcess, b + v.auth1, 0x200, PAGE_EXECUTE_READWRITE, out oldprotectflags);
				success &= WriteProcessMemory(hProcess, b + v.auth1, new byte[] {0xEB}, 1, out byteswritten); // send auth header for all protocols
				success &= WriteProcessMemory(hProcess, b + v.auth2, new byte[] {0x90, 0x90, 0x90, 0x90, 0x90, 0x90}, 6,
					out byteswritten); // always send auth header
			}
			if (patchOptions.SetCustomConfigDomain)
			{
				success &= WriteProcessMemory(hProcess, b + v.url, newurl, (uint)newurl.Length, out byteswritten); // (setting current)
			}
			if (patchOptions.UseHttp)
			{
				success &= VirtualProtectEx(hProcess, b + v.protocol1, 0x20, PAGE_READWRITE, out oldprotectflags);
				success &= WriteProcessMemory(hProcess, b + v.protocol1, http, (uint)http.Length, out byteswritten); // replace https with http
				success &= VirtualProtectEx(hProcess, b + v.protocol2, 1, PAGE_EXECUTE_READWRITE, out oldprotectflags);
				success &= WriteProcessMemory(hProcess, b + v.protocol2, new byte[] {(byte)http.Length}, 1, out byteswritten);
			}

			CloseHandle(hProcess);
			if (!success)
			{
				throw new Win32Exception(Marshal.GetLastWin32Error());
			}
			return true;
		}

		private static bool IsReadyForPatching(IntPtr hProcess, IntPtr baseAddress, Hitman2Version version)
		{
			byte[] buffer = { 0 };
			int bytesread;
			if (!ReadProcessMemory(hProcess, baseAddress + version.url, buffer, 1, out bytesread))
			{
				throw new Win32Exception(Marshal.GetLastWin32Error());
			}
			return buffer[0] != 0;
		}

		public struct Options
		{
			public bool DisableCertPinning;
			public bool AlwaysSendAuthHeader;
			public bool SetCustomConfigDomain;
			public string CustomConfigDomain;
			public bool UseHttp;
		}
	}
}
