// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Hitman2Patcher
{
	public partial class Form1 : Form
	{
		[DllImport("kernel32", SetLastError = true)]
		private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, int dwProcessId);
		[DllImport("kernel32", SetLastError = true)]
		private static extern bool CloseHandle(IntPtr hObject);
		[DllImport("kernel32")]
		private static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr address, byte[] buffer, uint size, out int byteswritten);
		[DllImport("kernel32.dll")]
		static extern bool VirtualProtectEx(IntPtr hProcess, IntPtr lpAddress, uint dwSize, uint flNewProtect, out uint lpflOldProtect);

		private const uint PROCESS_VM_WRITE = 0x0020; // Required to write to memory in a process using WriteProcessMemory.
		private const uint PROCESS_VM_OPERATION = 0x0008; // Required to perform an operation on the address space of a process using VirtualProtectEx
		private const uint PAGE_EXECUTE_READWRITE = 0x40;
		private const uint PAGE_READWRITE = 0x04;

		Timer timer;
		HashSet<int> patchedprocesses = new HashSet<int>();

		public Form1()
		{
			InitializeComponent();
			listView1.Columns[0].Width = listView1.Width - 4 - SystemInformation.VerticalScrollBarWidth;
			timer = new Timer();
			timer.Interval = 1000;
			timer.Tick += timer_Tick;
			timer.Enabled = true;
			log("Patcher ready");
			if (File.Exists("patcher.conf"))
			try
			{
				textBox1.Text = File.ReadAllText("patcher.conf");
			}
			catch (Exception)
			{
				// whatever, just use the default address
			}
		}

		void timer_Tick(object sender, EventArgs e)
		{
			Process[] hitmans = Process.GetProcessesByName("HITMAN2");
			foreach (Process hitman in hitmans)
			{
				if (!patchedprocesses.Contains(hitman.Id))
					try
					{
						patch(hitman, Hitman2Version.getVersion(hitman));
					}
					catch (Win32Exception)
					{
						log(String.Format("Failed to patch processid {0}: code {1}", hitman.Id, Marshal.GetLastWin32Error()));
						patchedprocesses.Add(hitman.Id);
					}
					catch (NotImplementedException)
					{
						log(String.Format("Failed to patch processid {0}: version", hitman.Id));
						patchedprocesses.Add(hitman.Id);
					}
			}
		}

		private void log(String msg)
		{
			listView1.Items.Insert(0, msg);
		}

		private void patch(Process process, Hitman2Version v)
		{
			IntPtr hProcess = OpenProcess(PROCESS_VM_WRITE | PROCESS_VM_OPERATION, false, process.Id);
			IntPtr b = process.MainModule.BaseAddress;
			int byteswritten;
			uint oldprotectflags;
			byte[] newurl = Encoding.ASCII.GetBytes(textBox1.Text).Concat(new byte[] { 0x00 }).ToArray();
			byte[] http = Encoding.ASCII.GetBytes("http://{0}").Concat(new byte[] { 0x00 }).ToArray();
			bool success = true;
			// WriteProcessMemory(hProcess, b + v.certpin, new byte[] {0xEB}, 1, out byteswritten); // bypass cert pinning
			success &= VirtualProtectEx(hProcess, b + v.auth1, 0x200, PAGE_EXECUTE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.auth1, new byte[] { 0xEB }, 1, out byteswritten); // send auth header for all protocols
			success &= WriteProcessMemory(hProcess, b + v.auth2, new byte[] { 0x90, 0x90, 0x90, 0x90, 0x90, 0x90 }, 6, out byteswritten); // always send auth header

			success &= VirtualProtectEx(hProcess, b + v.url1, 0x20, PAGE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.url1, newurl, (uint)newurl.Length, out byteswritten); // replace 'config.hitman.io' (setting default)
			success &= WriteProcessMemory(hProcess, b + v.url2, newurl, (uint)newurl.Length, out byteswritten); // (setting current)

			success &= VirtualProtectEx(hProcess, b + v.protocol1, 0x20, PAGE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.protocol1, http, (uint)http.Length, out byteswritten); // replace https with http
			success &= VirtualProtectEx(hProcess, b + v.protocol2, 1, PAGE_EXECUTE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.protocol2, new byte[] { (byte)http.Length }, 1, out byteswritten);

			CloseHandle(hProcess);
			if (success)
			{
				log(String.Format("Sucessfully patched processid {0}", process.Id));
				patchedprocesses.Add(process.Id);
			}
			else
			{
				throw new Win32Exception(Marshal.GetLastWin32Error());
			}
		}

		private void button1_Click(object sender, EventArgs e)
		{
			patchedprocesses.Clear();
		}

		private void Form1_FormClosing(object sender, FormClosingEventArgs e)
		{
			File.WriteAllText("patcher.conf", textBox1.Text);
		}
	}
}
