// Copyright (C) 2020-2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace Hitman2Patcher
{
	public partial class Form1 : Form
	{
		Timer timer;
		HashSet<int> patchedprocesses = new HashSet<int>();

		private static readonly Dictionary<string, string> publicServers = new Dictionary<string, string>
		{
			{"gm.hitmaps.com (H3 | HITMAPS Roulette, H2 | Ghost Mode)", "gm.hitmaps.com"},
			{"ghostmode.rdil.rocks (ghost mode)", "ghostmode.rdil.rocks"}
		};

		private static readonly Dictionary<string, string> publicServersReverse = publicServers.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);

		public Form1()
		{
			InitializeComponent();
			listView1.Columns[0].Width = listView1.Width - 4 - SystemInformation.VerticalScrollBarWidth;
			timer = new Timer();
			timer.Interval = 1000;
			timer.Tick += timer_Tick;
			timer.Enabled = true;

			try
			{
				currentSettings = Settings.getFromFile("patcher.conf");
			}
			catch (Exception)
			{
				currentSettings = new Settings();
			}

			log("Patcher ready");
			log("Select a server and start hitman");
			
		}

		void timer_Tick(object sender, EventArgs e)
		{
			IEnumerable<Process> hitmans = Process.GetProcessesByName("HITMAN")
				.Concat(Process.GetProcessesByName("HITMAN2"))
				.Concat(Process.GetProcessesByName("HITMAN3"));
			foreach (Process process in hitmans)
			{
				if (!patchedprocesses.Contains(process.Id))
					try
					{
						if (MemoryPatcher.Patch(process, currentSettings.patchOptions))
						{
							log(String.Format("Sucessfully patched processid {0}", process.Id));
							if (currentSettings.patchOptions.SetCustomConfigDomain)
							{
								log(String.Format("Injected server: {0}", getSelectedServerHostname()));
							}
							patchedprocesses.Add(process.Id);
						}
						// else: process not yet ready for patching, try again next timer tick
					}
					catch (Win32Exception err)
					{
						log(String.Format("Failed to patch processid {0}: error code {1}", process.Id, Marshal.GetLastWin32Error()));
						log(err.Message);
						patchedprocesses.Add(process.Id);
					}
					catch (NotImplementedException)
					{
						log(String.Format("Failed to patch processid {0}: unknown version", process.Id));
						patchedprocesses.Add(process.Id);
					}
			}
		}

		private void log(String msg)
		{
			listView1.Items.Insert(0, String.Format("[{0:HH:mm:ss}] - {1}", DateTime.Now, msg));
		}

		private void button1_Click(object sender, EventArgs e)
		{
			patchedprocesses.Clear();
		}

		private void Form1_FormClosing(object sender, FormClosingEventArgs e)
		{
			currentSettings.saveToFile("patcher.conf");
		}

		private string getSelectedServerHostname()
		{
			string hostname;

			if (!publicServers.TryGetValue(comboBox1.Text, out hostname))
			{
				hostname = comboBox1.Text;
			}

			if(string.IsNullOrEmpty(hostname))
			{
				hostname = "localhost";
			}

			return hostname;
		}

		private void setSelectedServerHostname(string input)
		{
			string result;

			if (!publicServersReverse.TryGetValue(input, out result))
			{
				result = input;
			}

			comboBox1.Text = result;
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

		private void button3_Click(object sender, EventArgs e)
		{
			OptionsForm optionsForm = new OptionsForm(currentSettings);
			DialogResult result = optionsForm.ShowDialog();
			if (result == DialogResult.OK)
			{
				currentSettings = optionsForm.settings;
			}
		}

		private Settings _currentSettings;
		private Settings currentSettings
		{
			get
			{
				if (_currentSettings.patchOptions.SetCustomConfigDomain)
				{
					_currentSettings.patchOptions.CustomConfigDomain = getSelectedServerHostname();
				}
				return _currentSettings;
			}
			set
			{
				_currentSettings = value;
				if (value.patchOptions.SetCustomConfigDomain)
				{
					setSelectedServerHostname(value.patchOptions.CustomConfigDomain);
					comboBox1.Enabled = true;
				}
				else
				{
					setSelectedServerHostname("custom domain disabled");
					comboBox1.Enabled = false;
				}

				comboBox1.Items.Clear();
				comboBox1.Items.AddRange(publicServers.Keys.ToArray<object>());
				if (value.showTestingDomains)
				{
					comboBox1.Items.Add("localhost");
					comboBox1.Items.Add("config.hitman.io");
				}
			}
		}

		private void Form1_Resize(object sender, EventArgs e)
		{
			listView1.Columns[0].Width = listView1.Width - 4 - SystemInformation.VerticalScrollBarWidth;
		}
	}
}
