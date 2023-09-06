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
	public partial class MainForm : Form, ILoggingProvider
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
			listViewLog.Columns[0].Width = listViewLog.Width - 4 - SystemInformation.VerticalScrollBarWidth;
			Timer timer = new Timer();
			timer.Interval = 1000;
			timer.Tag = this;
			timer.Tick += (sender, args) => MemoryPatcher.PatchAllProcesses(this, currentSettings.patchOptions);
			timer.Enabled = true;

			try
			{
				currentSettings = Settings.Load();
			}
			catch (Exception)
			{
				currentSettings = new Settings();
			}

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

		public void log(string msg)
		{
			foreach (string line in msg.Split('\n'))
			{
				listViewLog.Items.Insert(0, String.Format("[{0:HH:mm:ss}] - {1}", DateTime.Now, line));
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

			if (!publicServers.TryGetValue(comboBoxAddress.Text, out hostname))
			{
				hostname = comboBoxAddress.Text;
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

			comboBoxAddress.Text = result;
		}

		private void linkLabelMadeBy_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
		{
			Process.Start("https://gitlab.com/grappigegovert/localghost");
		}

		private void buttonStartGame_Click(object sender, EventArgs e)
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
					comboBoxAddress.Enabled = true;
				}
				else
				{
					setSelectedServerHostname("custom domain disabled");
					comboBoxAddress.Enabled = false;
				}

				comboBoxAddress.Items.Clear();
				comboBoxAddress.Items.AddRange(publicServers.Keys.ToArray<object>());
				comboBoxAddress.Items.AddRange(value.domains.ToArray<object>());
				updateTrayDomains();
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
				listViewLog.Columns[0].Width = listViewLog.Width - 4 - SystemInformation.VerticalScrollBarWidth;
			}
		}

		private void copyLogToClipboardToolStripMenuItem_Click(object sender, EventArgs e)
		{
			StringBuilder builder = new StringBuilder();
			foreach (ListViewItem item in listViewLog.Items)
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
					if (item.Text == clickedItem.Text)
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
			string selectedHostname = getSelectedServerHostname();
			foreach (string domain in publicServers.Values.Concat(currentSettings.domains))
			{
				if (!string.IsNullOrWhiteSpace(domain))
				{
					ToolStripMenuItem item = new ToolStripMenuItem();
					item.Text = domain;
					item.Click += domainItem_Click;
					if (domain == selectedHostname)
					{
						item.Checked = true;
					}

					domainsTrayMenu.DropDownItems.Add(item);
				}
			}
		}
	}
}
