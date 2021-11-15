using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace HitmanPatcher
{
	public partial class TrayOptions : Form
	{
		public struct settings
		{
			public bool startMin;
			public bool minTray;
			public string[] domains;
		}

		public settings options
		{
			get
			{
				return new settings()
				{
					startMin = startBox.Checked,
					minTray = minBox.Checked,
					domains = domainsBox.Text.Split(new char[] {'\n'})
				};
			}
			private set
			{
				startBox.Checked = value.startMin;
				minBox.Checked = value.minTray;
				domainsBox.Text = string.Join("\n", value.domains);
			}
		}

		public TrayOptions(settings currentSettings)
		{
			InitializeComponent();
			this.options = currentSettings;
		}

		private void cancelButton_Click(object sender, EventArgs e)
		{
			this.DialogResult = DialogResult.Cancel;
			this.Close();
		}

		private void saveButton_Click(object sender, EventArgs e)
		{
			this.DialogResult = DialogResult.OK;
			this.Close();
		}
	}
}
