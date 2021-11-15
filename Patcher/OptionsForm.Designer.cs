// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	partial class OptionsForm
	{
		/// <summary>
		/// Required designer variable.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// Clean up any resources being used.
		/// </summary>
		/// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows Form Designer generated code

		/// <summary>
		/// Required method for Designer support - do not modify
		/// the contents of this method with the code editor.
		/// </summary>
		private void InitializeComponent()
		{
			this.buttonSave = new System.Windows.Forms.Button();
			this.buttonCancel = new System.Windows.Forms.Button();
			this.groupBox1 = new System.Windows.Forms.GroupBox();
			this.checkBoxNoForceOffline = new System.Windows.Forms.CheckBox();
			this.checkBoxHttp = new System.Windows.Forms.CheckBox();
			this.checkBoxSetDomain = new System.Windows.Forms.CheckBox();
			this.checkBoxAuthHead = new System.Windows.Forms.CheckBox();
			this.checkBoxCertPin = new System.Windows.Forms.CheckBox();
			this.checkBoxTestingDomains = new System.Windows.Forms.CheckBox();
			this.buttonReset = new System.Windows.Forms.Button();
			this.comboBoxVersion = new System.Windows.Forms.ComboBox();
			this.checkBoxForceVersion = new System.Windows.Forms.CheckBox();
			this.trayOptionsButton = new System.Windows.Forms.Button();
			this.groupBox1.SuspendLayout();
			this.SuspendLayout();
			// 
			// buttonSave
			// 
			this.buttonSave.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.buttonSave.Location = new System.Drawing.Point(213, 129);
			this.buttonSave.Margin = new System.Windows.Forms.Padding(0, 0, 0, 0);
			this.buttonSave.Name = "buttonSave";
			this.buttonSave.Size = new System.Drawing.Size(55, 26);
			this.buttonSave.TabIndex = 0;
			this.buttonSave.Text = "Save";
			this.buttonSave.UseVisualStyleBackColor = true;
			this.buttonSave.Click += new System.EventHandler(this.buttonSave_Click);
			// 
			// buttonCancel
			// 
			this.buttonCancel.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.buttonCancel.Location = new System.Drawing.Point(272, 129);
			this.buttonCancel.Margin = new System.Windows.Forms.Padding(0, 0, 0, 0);
			this.buttonCancel.Name = "buttonCancel";
			this.buttonCancel.Size = new System.Drawing.Size(55, 26);
			this.buttonCancel.TabIndex = 1;
			this.buttonCancel.Text = "Cancel";
			this.buttonCancel.UseVisualStyleBackColor = true;
			this.buttonCancel.Click += new System.EventHandler(this.buttonCancel_Click);
			// 
			// groupBox1
			// 
			this.groupBox1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left)));
			this.groupBox1.Controls.Add(this.checkBoxNoForceOffline);
			this.groupBox1.Controls.Add(this.checkBoxHttp);
			this.groupBox1.Controls.Add(this.checkBoxSetDomain);
			this.groupBox1.Controls.Add(this.checkBoxAuthHead);
			this.groupBox1.Controls.Add(this.checkBoxCertPin);
			this.groupBox1.Location = new System.Drawing.Point(9, 10);
			this.groupBox1.Margin = new System.Windows.Forms.Padding(2);
			this.groupBox1.Name = "groupBox1";
			this.groupBox1.Padding = new System.Windows.Forms.Padding(2);
			this.groupBox1.Size = new System.Drawing.Size(189, 125);
			this.groupBox1.TabIndex = 2;
			this.groupBox1.TabStop = false;
			this.groupBox1.Text = "Patch options";
			// 
			// checkBoxNoForceOffline
			// 
			this.checkBoxNoForceOffline.AutoSize = true;
			this.checkBoxNoForceOffline.Location = new System.Drawing.Point(4, 105);
			this.checkBoxNoForceOffline.Margin = new System.Windows.Forms.Padding(2);
			this.checkBoxNoForceOffline.Name = "checkBoxNoForceOffline";
			this.checkBoxNoForceOffline.Size = new System.Drawing.Size(184, 17);
			this.checkBoxNoForceOffline.TabIndex = 4;
			this.checkBoxNoForceOffline.Text = "Make dynamic resources optional";
			this.checkBoxNoForceOffline.UseVisualStyleBackColor = true;
			// 
			// checkBoxHttp
			// 
			this.checkBoxHttp.AutoSize = true;
			this.checkBoxHttp.Location = new System.Drawing.Point(4, 83);
			this.checkBoxHttp.Margin = new System.Windows.Forms.Padding(2);
			this.checkBoxHttp.Name = "checkBoxHttp";
			this.checkBoxHttp.Size = new System.Drawing.Size(141, 17);
			this.checkBoxHttp.TabIndex = 3;
			this.checkBoxHttp.Text = "Use http instead of https";
			this.checkBoxHttp.UseVisualStyleBackColor = true;
			// 
			// checkBoxSetDomain
			// 
			this.checkBoxSetDomain.AutoSize = true;
			this.checkBoxSetDomain.Location = new System.Drawing.Point(4, 61);
			this.checkBoxSetDomain.Margin = new System.Windows.Forms.Padding(2);
			this.checkBoxSetDomain.Name = "checkBoxSetDomain";
			this.checkBoxSetDomain.Size = new System.Drawing.Size(182, 17);
			this.checkBoxSetDomain.TabIndex = 2;
			this.checkBoxSetDomain.Text = "Set Online_VersionConfigDomain";
			this.checkBoxSetDomain.UseVisualStyleBackColor = true;
			// 
			// checkBoxAuthHead
			// 
			this.checkBoxAuthHead.AutoSize = true;
			this.checkBoxAuthHead.Location = new System.Drawing.Point(4, 39);
			this.checkBoxAuthHead.Margin = new System.Windows.Forms.Padding(2);
			this.checkBoxAuthHead.Name = "checkBoxAuthHead";
			this.checkBoxAuthHead.Size = new System.Drawing.Size(146, 17);
			this.checkBoxAuthHead.TabIndex = 1;
			this.checkBoxAuthHead.Text = "Always send Auth header";
			this.checkBoxAuthHead.UseVisualStyleBackColor = true;
			// 
			// checkBoxCertPin
			// 
			this.checkBoxCertPin.AutoSize = true;
			this.checkBoxCertPin.Location = new System.Drawing.Point(4, 17);
			this.checkBoxCertPin.Margin = new System.Windows.Forms.Padding(2);
			this.checkBoxCertPin.Name = "checkBoxCertPin";
			this.checkBoxCertPin.Size = new System.Drawing.Size(119, 17);
			this.checkBoxCertPin.TabIndex = 0;
			this.checkBoxCertPin.Text = "Disable cert pinning";
			this.checkBoxCertPin.UseVisualStyleBackColor = true;
			// 
			// checkBoxTestingDomains
			// 
			this.checkBoxTestingDomains.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.checkBoxTestingDomains.AutoSize = true;
			this.checkBoxTestingDomains.Location = new System.Drawing.Point(14, 140);
			this.checkBoxTestingDomains.Margin = new System.Windows.Forms.Padding(2);
			this.checkBoxTestingDomains.Name = "checkBoxTestingDomains";
			this.checkBoxTestingDomains.Size = new System.Drawing.Size(190, 17);
			this.checkBoxTestingDomains.TabIndex = 3;
			this.checkBoxTestingDomains.Text = "Show testing domains in dropdown";
			this.checkBoxTestingDomains.UseVisualStyleBackColor = true;
			// 
			// buttonReset
			// 
			this.buttonReset.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.buttonReset.Location = new System.Drawing.Point(212, 54);
			this.buttonReset.Margin = new System.Windows.Forms.Padding(0, 0, 0, 0);
			this.buttonReset.Name = "buttonReset";
			this.buttonReset.Size = new System.Drawing.Size(115, 28);
			this.buttonReset.TabIndex = 4;
			this.buttonReset.Text = "Reset defaults";
			this.buttonReset.UseVisualStyleBackColor = true;
			this.buttonReset.Click += new System.EventHandler(this.buttonReset_Click);
			// 
			// comboBoxVersion
			// 
			this.comboBoxVersion.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.comboBoxVersion.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
			this.comboBoxVersion.Enabled = false;
			this.comboBoxVersion.FormattingEnabled = true;
			this.comboBoxVersion.Location = new System.Drawing.Point(213, 30);
			this.comboBoxVersion.Margin = new System.Windows.Forms.Padding(0, 0, 0, 0);
			this.comboBoxVersion.Name = "comboBoxVersion";
			this.comboBoxVersion.Size = new System.Drawing.Size(114, 21);
			this.comboBoxVersion.TabIndex = 5;
			// 
			// checkBoxForceVersion
			// 
			this.checkBoxForceVersion.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.checkBoxForceVersion.AutoSize = true;
			this.checkBoxForceVersion.Location = new System.Drawing.Point(213, 11);
			this.checkBoxForceVersion.Margin = new System.Windows.Forms.Padding(0, 0, 0, 0);
			this.checkBoxForceVersion.Name = "checkBoxForceVersion";
			this.checkBoxForceVersion.Size = new System.Drawing.Size(90, 17);
			this.checkBoxForceVersion.TabIndex = 6;
			this.checkBoxForceVersion.Text = "Force version";
			this.checkBoxForceVersion.UseVisualStyleBackColor = true;
			this.checkBoxForceVersion.CheckedChanged += new System.EventHandler(this.checkBoxForceVersion_CheckedChanged);
			// 
			// trayOptionsButton
			// 
			this.trayOptionsButton.Location = new System.Drawing.Point(213, 85);
			this.trayOptionsButton.Name = "trayOptionsButton";
			this.trayOptionsButton.Size = new System.Drawing.Size(114, 37);
			this.trayOptionsButton.TabIndex = 9;
			this.trayOptionsButton.Text = "Tray Options";
			this.trayOptionsButton.UseVisualStyleBackColor = true;
			this.trayOptionsButton.Click += new System.EventHandler(this.button1_Click);
			// 
			// OptionsForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(336, 162);
			this.Controls.Add(this.trayOptionsButton);
			this.Controls.Add(this.checkBoxForceVersion);
			this.Controls.Add(this.comboBoxVersion);
			this.Controls.Add(this.buttonReset);
			this.Controls.Add(this.checkBoxTestingDomains);
			this.Controls.Add(this.groupBox1);
			this.Controls.Add(this.buttonCancel);
			this.Controls.Add(this.buttonSave);
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
			this.Margin = new System.Windows.Forms.Padding(2);
			this.Name = "OptionsForm";
			this.ShowIcon = false;
			this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
			this.Text = "Advanced Options";
			this.groupBox1.ResumeLayout(false);
			this.groupBox1.PerformLayout();
			this.ResumeLayout(false);
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.Button buttonSave;
		private System.Windows.Forms.Button buttonCancel;
		private System.Windows.Forms.GroupBox groupBox1;
		private System.Windows.Forms.CheckBox checkBoxAuthHead;
		private System.Windows.Forms.CheckBox checkBoxCertPin;
		private System.Windows.Forms.CheckBox checkBoxSetDomain;
		private System.Windows.Forms.CheckBox checkBoxHttp;
		private System.Windows.Forms.CheckBox checkBoxTestingDomains;
		private System.Windows.Forms.Button buttonReset;
		private System.Windows.Forms.ComboBox comboBoxVersion;
		private System.Windows.Forms.CheckBox checkBoxForceVersion;
		private System.Windows.Forms.CheckBox checkBoxNoForceOffline;
		private System.Windows.Forms.Button trayOptionsButton;
	}
}