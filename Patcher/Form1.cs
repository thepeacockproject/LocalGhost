// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
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
		[DllImport("kernel32.dll", SetLastError = true)]
		static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr address, [Out] byte[] buffer, uint size, out int numberOfBytesRead);
		[DllImport("kernel32.dll")]
		static extern bool VirtualProtectEx(IntPtr hProcess, IntPtr lpAddress, uint dwSize, uint flNewProtect, out uint lpflOldProtect);

		private const uint PROCESS_VM_READ = 0x0010; //Required to read memory in a process using ReadProcessMemory.
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
			comboBox1.Text = "localhost";

			log("Patcher ready");
			log("Select a server and start hitman 2");
			if (File.Exists("patcher.conf"))
			{
				try
				{
					comboBox1.Text = File.ReadAllText("patcher.conf");
				}
				catch (Exception)
				{
					// whatever, just use the default address
				}
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
						log(String.Format("Failed to patch processid {0}: error code {1}", hitman.Id, Marshal.GetLastWin32Error()));
						patchedprocesses.Add(hitman.Id);
					}
					catch (NotImplementedException)
					{
						log(String.Format("Failed to patch processid {0}: unknown version", hitman.Id));
						patchedprocesses.Add(hitman.Id);
					}
			}
		}

		private void log(String msg)
		{
			listView1.Items.Insert(0, String.Format("[{0:HH:mm:ss}] - {1}", DateTime.Now, msg));
		}

		private void patch(Process process, Hitman2Version v)
		{
			IntPtr hProcess = OpenProcess(PROCESS_VM_READ | PROCESS_VM_WRITE | PROCESS_VM_OPERATION, false, process.Id);
			IntPtr b = process.MainModule.BaseAddress;
			int byteswritten;
			uint oldprotectflags;
			byte[] newurl = Encoding.ASCII.GetBytes(getSelectedServerHostname()).Concat(new byte[] { 0x00 }).ToArray();
			byte[] http = Encoding.ASCII.GetBytes("http://{0}").Concat(new byte[] { 0x00 }).ToArray();
			bool success = true;

			if(!checkReadyForPatching(hProcess, b, v)) {
				CloseHandle(hProcess);
				return;
			}

			// WriteProcessMemory(hProcess, b + v.certpin, new byte[] {0xEB}, 1, out byteswritten); // bypass cert pinning
			success &= VirtualProtectEx(hProcess, b + v.auth1, 0x200, PAGE_EXECUTE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.auth1, new byte[] { 0xEB }, 1, out byteswritten); // send auth header for all protocols
			success &= WriteProcessMemory(hProcess, b + v.auth2, new byte[] { 0x90, 0x90, 0x90, 0x90, 0x90, 0x90 }, 6, out byteswritten); // always send auth header

			success &= WriteProcessMemory(hProcess, b + v.url, newurl, (uint)newurl.Length, out byteswritten); // (setting current)

			success &= VirtualProtectEx(hProcess, b + v.protocol1, 0x20, PAGE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.protocol1, http, (uint)http.Length, out byteswritten); // replace https with http
			success &= VirtualProtectEx(hProcess, b + v.protocol2, 1, PAGE_EXECUTE_READWRITE, out oldprotectflags);
			success &= WriteProcessMemory(hProcess, b + v.protocol2, new byte[] { (byte)http.Length }, 1, out byteswritten);

			CloseHandle(hProcess);
			if (success)
			{
				log(String.Format("Sucessfully patched processid {0}", process.Id));
				log(String.Format("Injected server : {0}", getSelectedServerHostname()));
				patchedprocesses.Add(process.Id);
			}
			else
			{
				throw new Win32Exception(Marshal.GetLastWin32Error());
			}
		}

		private bool checkReadyForPatching(IntPtr hProcess, IntPtr baseAddress, Hitman2Version version)
		{
			byte[] buffer = { 0 };
			int bytesread;
			if (!ReadProcessMemory(hProcess, baseAddress + version.url, buffer, 1, out bytesread))
			{
				throw new Win32Exception(Marshal.GetLastWin32Error());
			}
			return buffer[0] != 0;
		}

		private void button1_Click(object sender, EventArgs e)
		{
			patchedprocesses.Clear();
		}

		private void Form1_FormClosing(object sender, FormClosingEventArgs e)
		{
			File.WriteAllText("patcher.conf", getSelectedServerHostname());
		}

		private string getSelectedServerHostname()
		{
			var value = comboBox1.Text.Split('-')[0].Trim();

			if(string.IsNullOrEmpty(value))
			{
				value = "localhost";
			}

			return value;
		}

		private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
		{
			Process.Start("https://gitlab.com/grappigegovert/localghost");
		}

		private void button2_Click(object sender, EventArgs e)
		{
			if (Process.GetProcessesByName("steam").Length > 0)
			{
				Process.Start("steam://run/863550");
			}
			else
			{
				MessageBox.Show("Please launch steam first, before using this button.");
			}
		}
	}
}
