// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Linq;
using System.Windows.Forms;

namespace HitmanPatcher
{
	public partial class OptionsForm : Form
	{
		private string customDomain;

		TrayOptions.settings traySettings = new TrayOptions.settings();

		public OptionsForm(Settings currentSettings)
		{
			InitializeComponent();
			comboBoxVersion.Items.AddRange(HitmanVersion.Versions.ToArray<object>());
			this.settings = currentSettings;

			traySettings.startMin = currentSettings.startInTray;
			traySettings.minTray = currentSettings.minToTray;
			traySettings.domains = currentSettings.trayDomains;
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
					showTestingDomains = checkBoxTestingDomains.Checked,
					startInTray = traySettings.startMin,
					minToTray = traySettings.minTray,
					trayDomains = traySettings.domains
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
				checkBoxTestingDomains.Checked = value.showTestingDomains;
				checkBoxForceVersion.Checked = value.patchOptions.ForcedVersion != "";
				comboBoxVersion.Text = value.patchOptions.ForcedVersion;
				this.traySettings.startMin = value.startInTray;
				this.traySettings.minTray = value.minToTray;
				this.traySettings.domains = value.trayDomains;
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

		private void button1_Click(object sender, EventArgs e)
		{
			TrayOptions trayForm = new TrayOptions(traySettings);
			DialogResult result = trayForm.ShowDialog();
			if (result == DialogResult.OK)
			{
				traySettings = trayForm.options;
			}
		}
	}
}
