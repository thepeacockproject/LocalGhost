// Copyright (C) 2020-2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace HitmanPatcher
{
	public partial class MainForm : Form
	{
		private static readonly Dictionary<string, string> publicServers = new Dictionary<string, string>
		{
			{"gm.hitmaps.com (Ghost Mode, Roulette)", "gm.hitmaps.com"},
			{"ghostmode.rdil.rocks (Ghost Mode)", "ghostmode.rdil.rocks"}
		};

		private static readonly Dictionary<string, string> publicServersReverse = publicServers.ToDictionary(kvp => kvp.Value, kvp => kvp.Key);
		
		public MainForm()
		{
			InitializeComponent();
			listView1.Columns[0].Width = listView1.Width - 4 - SystemInformation.VerticalScrollBarWidth;
			Timer timer = new Timer();
			timer.Interval = 1000;
			timer.Tag = this;
			timer.Tick += MemoryPatcher.timer_Tick;
			timer.Enabled = true;

			try
			{
				currentSettings = Settings.Load();
			}
			catch (Exception)
			{
				currentSettings = new Settings();
			}
			updateTrayDomains();

			log("Patcher ready");
			log("Select a server and start hitman");

			if (currentSettings.startInTray)
			{
				trayIcon.Visible = true;
				this.WindowState = FormWindowState.Minimized;
				this.Hide();
				this.ShowInTaskbar = false;
				trayIcon.ShowBalloonTip(5000, "LocalGhost Patcher", "The LocalGhost Patcher has been started in the tray.", ToolTipIcon.Info);
			}			
		}

		public void log(String msg)
		{
			foreach (string line in msg.Split('\n'))
			{
				listView1.Items.Insert(0, String.Format("[{0:HH:mm:ss}] - {1}", DateTime.Now, line));
			}
		}

		private void buttonRepatch_Click(object sender, EventArgs e)
		{
			MemoryPatcher.patchedprocesses.Clear();
		}

		private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
		{
			currentSettings.Save();
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

		private void buttonOptions_Click(object sender, EventArgs e)
		{
			OptionsForm optionsForm = new OptionsForm(currentSettings);
			DialogResult result = optionsForm.ShowDialog();
			if (result == DialogResult.OK)
			{
				currentSettings = optionsForm.settings;
				updateTrayDomains();
			}
		}

		private Settings _currentSettings;
		public Settings currentSettings
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

		private void MainForm_Resize(object sender, EventArgs e)
		{
			if (this.WindowState == FormWindowState.Minimized && currentSettings.minimizeToTray)
			{
				this.Hide();
				this.ShowInTaskbar = false;
				trayIcon.Visible = true;
				trayIcon.ShowBalloonTip(5000, "LocalGhost Patcher", "The LocalGhost Patcher has been minimized to the tray.", ToolTipIcon.Info);
			}
			else
			{
				listView1.Columns[0].Width = listView1.Width - 4 - SystemInformation.VerticalScrollBarWidth;
			}
		}

		private void copyLogToClipboardToolStripMenuItem_Click(object sender, EventArgs e)
		{
			StringBuilder builder = new StringBuilder();
			foreach (ListViewItem item in listView1.Items)
			{
				builder.AppendLine(item.Text);
			}
			Clipboard.SetText(builder.ToString());
		}

		private void menuItemOpen_Click(object sender, EventArgs e)
		{
			this.Visible = true;
			this.WindowState = FormWindowState.Normal;

			this.Focus();
			this.ShowInTaskbar = true;
			trayIcon.Visible = false;
		}

		private void menuItemExit_Click(object sender, EventArgs e)
		{
			Application.Exit();
		}

		private void domainItem_Click(object sender, EventArgs e)
		{
			ToolStripMenuItem clickedItem = sender as ToolStripMenuItem;
			if (clickedItem != null)
			{
				foreach (ToolStripMenuItem item in domainsTrayMenu.DropDownItems)
				{
					if (item == clickedItem)
					{
						item.Checked = true;
					}
					else
					{
						item.Checked = false;
					}
				}

				setSelectedServerHostname(clickedItem.Text);
			}
		}

		private void updateTrayDomains()
		{
			domainsTrayMenu.DropDownItems.Clear();
			foreach (string domain in currentSettings.trayDomains)
			{
				if (!string.IsNullOrWhiteSpace(domain))
				{
					ToolStripMenuItem item = new ToolStripMenuItem();
					item.Text = domain;
					item.Click += domainItem_Click;

					domainsTrayMenu.DropDownItems.Add(item);
				}
			}
		}
	}
}
