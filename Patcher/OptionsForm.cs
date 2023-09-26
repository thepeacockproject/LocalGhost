// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;

namespace HitmanPatcher
{
	public partial class OptionsForm : Form
	{
		private string customDomain;

		public OptionsForm(Settings currentSettings)
		{
			InitializeComponent();
			comboBoxVersion.Items.AddRange(HitmanVersion.Versions.ToArray<object>());
			comboBoxStartButtonPreset.Items.AddRange(Settings.startButtonPresets.Select(x => x.Name).ToArray());

			this.settings = currentSettings;
		}

		private void buttonCancel_Click(object sender, EventArgs e)
		{
			this.DialogResult = DialogResult.Cancel;
			this.Close();
		}

		public Settings settings
		{
			get
			{
				return new Settings()
				{
					patchOptions = new MemoryPatcher.Options()
					{
						DisableCertPinning = checkBoxCertPin.Checked,
						AlwaysSendAuthHeader = checkBoxAuthHead.Checked,
						SetCustomConfigDomain = checkBoxSetDomain.Checked,
						CustomConfigDomain = this.customDomain,
						UseHttp = checkBoxHttp.Checked,
						DisableForceOfflineOnFailedDynamicResources = checkBoxNoForceOffline.Checked,
						ForcedVersion = comboBoxVersion.Text == null ? "" : comboBoxVersion.Text
					},
					startInTray = checkBoxTrayStart.Checked,
					minimizeToTray = checkBoxTrayMinimize.Checked,
					domains = textBoxDomains.Lines.Where(d => !string.IsNullOrWhiteSpace(d)).ToList(),
					startButtonPreset = comboBoxStartButtonPreset.SelectedIndex,
					startButtonCommand = textBoxStartButtonCommand.Text,
					startButtonText = textBoxStartButtonText.Text,
				};
			}
			private set
			{
				checkBoxCertPin.Checked = value.patchOptions.DisableCertPinning;
				checkBoxAuthHead.Checked = value.patchOptions.AlwaysSendAuthHeader;
				checkBoxSetDomain.Checked = value.patchOptions.SetCustomConfigDomain;
				this.customDomain = value.patchOptions.CustomConfigDomain;
				checkBoxHttp.Checked = value.patchOptions.UseHttp;
				checkBoxNoForceOffline.Checked = value.patchOptions.DisableForceOfflineOnFailedDynamicResources;
				checkBoxForceVersion.Checked = value.patchOptions.ForcedVersion != "";
				comboBoxVersion.Text = value.patchOptions.ForcedVersion;
				checkBoxTrayStart.Checked = value.startInTray;
				checkBoxTrayMinimize.Checked = value.minimizeToTray;
				textBoxDomains.Lines = value.domains.ToArray();
				comboBoxStartButtonPreset.SelectedIndex = value.startButtonPreset;
				textBoxStartButtonCommand.Text = value.startButtonCommand;
				textBoxStartButtonText.Text = value.startButtonText;
				if (Settings.startButtonPresets[value.startButtonPreset].Name != "Custom"
					&& value.startButtonCommand.Contains("-skip_launcher"))
				{
					checkBoxSkipLauncher.Checked = true;
				}
				else
				{
					checkBoxSkipLauncher.Checked = false;
				}
			}
		}

		private void buttonSave_Click(object sender, EventArgs e)
		{
			this.DialogResult = DialogResult.OK;
			this.Close();
		}

		private void buttonReset_Click(object sender, EventArgs e)
		{
			this.settings = new Settings();
		}

		private void checkBoxForceVersion_CheckedChanged(object sender, EventArgs e)
		{
			if (checkBoxForceVersion.Checked)
			{
				comboBoxVersion.Enabled = true;
				comboBoxVersion.SelectedIndex = 0;
			}
			else
			{
				comboBoxVersion.Enabled = false;
				comboBoxVersion.SelectedIndex = -1;
			}
		}

		private void textBoxDomains_Validating(object sender, System.ComponentModel.CancelEventArgs e)
		{
			bool invalid = false;
			foreach (string line in textBoxDomains.Lines)
			{
				if (line.Length > 160)
				{
					invalid = true;
				}
			}
			if (invalid)
			{
				MessageBox.Show("One or more domains are more than 160 characters long;"
								+ Environment.NewLine + "Don't.", "Error");
				e.Cancel = true;
			}
		}

		private void comboBoxStartButtonPreset_SelectedIndexChanged(object sender, EventArgs e)
		{
			if (comboBoxStartButtonPreset.SelectedIndex == -1)
				return;

			StartButtonPreset preset = Settings.startButtonPresets[comboBoxStartButtonPreset.SelectedIndex];

			if ((string)comboBoxStartButtonPreset.SelectedItem == "Custom")
			{
				checkBoxSkipLauncher.Enabled =
				textBoxStartButtonText.ReadOnly =
				textBoxStartButtonCommand.ReadOnly = false;
				checkBoxSkipLauncher.Checked = false;
			}
			else
			{
				checkBoxSkipLauncher.Enabled =
				textBoxStartButtonText.ReadOnly =
				textBoxStartButtonCommand.ReadOnly = true;

				string additionalParameter = checkBoxSkipLauncher.Checked ? " -skip_launcher" : "";
				textBoxStartButtonCommand.Text = preset.Command + additionalParameter;
				textBoxStartButtonText.Text = preset.Text;
			}
		}

		private void checkBoxSkipLauncher_CheckedChanged(object sender, EventArgs e)
		{
			if (comboBoxStartButtonPreset.SelectedIndex == -1 || (string)comboBoxStartButtonPreset.SelectedItem == "Custom")
				return;

			string additionalParameter = checkBoxSkipLauncher.Checked ? " -skip_launcher" : "";
			textBoxStartButtonCommand.Text = Settings.startButtonPresets[comboBoxStartButtonPreset.SelectedIndex].Command + additionalParameter;
		}
	}
}
