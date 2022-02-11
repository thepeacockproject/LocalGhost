// Copyright (C) 2021 Anthony Fuller
// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.Windows.Forms;

namespace HitmanPatcher
{
	public partial class TrayOptionsForm : Form
	{
		public TrayOptionsForm(bool startInTray, bool minimizeToTray, List<string> trayDomains)
		{
			InitializeComponent();
			this.startInTray = startInTray;
			this.minimizeToTray = minimizeToTray;
			this.trayDomains = trayDomains;
		}

		public bool startInTray
		{
			get { return checkboxStart.Checked; }
			set { checkboxStart.Checked = value; }
		}

		public bool minimizeToTray
		{
			get { return checkBoxMinimize.Checked; }
			set { checkBoxMinimize.Checked = value; }
		}

		public List<string> trayDomains
		{
			get { return new List<string>(textBoxDomains.Lines); }
			set { textBoxDomains.Lines = value.ToArray(); }
		}

		private void buttonCancel_Click(object sender, EventArgs e)
		{
			this.DialogResult = DialogResult.Cancel;
			this.Close();
		}

		private void buttonSave_Click(object sender, EventArgs e)
		{
			this.DialogResult = DialogResult.OK;
			this.Close();
		}
	}
}
