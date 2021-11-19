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
			this.buttonTrayOptions = new System.Windows.Forms.Button();
			this.groupBox1.SuspendLayout();
			this.SuspendLayout();
			// 
			// buttonSave
			// 
			this.buttonSave.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.buttonSave.Location = new System.Drawing.Point(283, 159);
			this.buttonSave.Margin = new System.Windows.Forms.Padding(0);
			this.buttonSave.Name = "buttonSave";
			this.buttonSave.Size = new System.Drawing.Size(73, 32);
			this.buttonSave.TabIndex = 0;
			this.buttonSave.Text = "Save";
			this.buttonSave.UseVisualStyleBackColor = true;
			this.buttonSave.Click += new System.EventHandler(this.buttonSave_Click);
			// 
			// buttonCancel
			// 
			this.buttonCancel.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.buttonCancel.Location = new System.Drawing.Point(363, 159);
			this.buttonCancel.Margin = new System.Windows.Forms.Padding(0);
			this.buttonCancel.Name = "buttonCancel";
			this.buttonCancel.Size = new System.Drawing.Size(73, 32);
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
			this.groupBox1.Location = new System.Drawing.Point(12, 12);
			this.groupBox1.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.groupBox1.Name = "groupBox1";
			this.groupBox1.Padding = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.groupBox1.Size = new System.Drawing.Size(252, 154);
			this.groupBox1.TabIndex = 2;
			this.groupBox1.TabStop = false;
			this.groupBox1.Text = "Patch options";
			// 
			// checkBoxNoForceOffline
			// 
			this.checkBoxNoForceOffline.AutoSize = true;
			this.checkBoxNoForceOffline.Location = new System.Drawing.Point(5, 129);
			this.checkBoxNoForceOffline.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.checkBoxNoForceOffline.Name = "checkBoxNoForceOffline";
			this.checkBoxNoForceOffline.Size = new System.Drawing.Size(241, 21);
			this.checkBoxNoForceOffline.TabIndex = 4;
			this.checkBoxNoForceOffline.Text = "Make dynamic resources optional";
			this.checkBoxNoForceOffline.UseVisualStyleBackColor = true;
			// 
			// checkBoxHttp
			// 
			this.checkBoxHttp.AutoSize = true;
			this.checkBoxHttp.Location = new System.Drawing.Point(5, 102);
			this.checkBoxHttp.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.checkBoxHttp.Name = "checkBoxHttp";
			this.checkBoxHttp.Size = new System.Drawing.Size(184, 21);
			this.checkBoxHttp.TabIndex = 3;
			this.checkBoxHttp.Text = "Use http instead of https";
			this.checkBoxHttp.UseVisualStyleBackColor = true;
			// 
			// checkBoxSetDomain
			// 
			this.checkBoxSetDomain.AutoSize = true;
			this.checkBoxSetDomain.Location = new System.Drawing.Point(5, 75);
			this.checkBoxSetDomain.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.checkBoxSetDomain.Name = "checkBoxSetDomain";
			this.checkBoxSetDomain.Size = new System.Drawing.Size(240, 21);
			this.checkBoxSetDomain.TabIndex = 2;
			this.checkBoxSetDomain.Text = "Set Online_VersionConfigDomain";
			this.checkBoxSetDomain.UseVisualStyleBackColor = true;
			// 
			// checkBoxAuthHead
			// 
			this.checkBoxAuthHead.AutoSize = true;
			this.checkBoxAuthHead.Location = new System.Drawing.Point(5, 48);
			this.checkBoxAuthHead.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.checkBoxAuthHead.Name = "checkBoxAuthHead";
			this.checkBoxAuthHead.Size = new System.Drawing.Size(190, 21);
			this.checkBoxAuthHead.TabIndex = 1;
			this.checkBoxAuthHead.Text = "Always send Auth header";
			this.checkBoxAuthHead.UseVisualStyleBackColor = true;
			// 
			// checkBoxCertPin
			// 
			this.checkBoxCertPin.AutoSize = true;
			this.checkBoxCertPin.Location = new System.Drawing.Point(5, 21);
			this.checkBoxCertPin.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.checkBoxCertPin.Name = "checkBoxCertPin";
			this.checkBoxCertPin.Size = new System.Drawing.Size(155, 21);
			this.checkBoxCertPin.TabIndex = 0;
			this.checkBoxCertPin.Text = "Disable cert pinning";
			this.checkBoxCertPin.UseVisualStyleBackColor = true;
			// 
			// checkBoxTestingDomains
			// 
			this.checkBoxTestingDomains.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.checkBoxTestingDomains.AutoSize = true;
			this.checkBoxTestingDomains.Location = new System.Drawing.Point(19, 172);
			this.checkBoxTestingDomains.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.checkBoxTestingDomains.Name = "checkBoxTestingDomains";
			this.checkBoxTestingDomains.Size = new System.Drawing.Size(248, 21);
			this.checkBoxTestingDomains.TabIndex = 3;
			this.checkBoxTestingDomains.Text = "Show testing domains in dropdown";
			this.checkBoxTestingDomains.UseVisualStyleBackColor = true;
			// 
			// buttonReset
			// 
			this.buttonReset.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.buttonReset.Location = new System.Drawing.Point(283, 119);
			this.buttonReset.Margin = new System.Windows.Forms.Padding(0);
			this.buttonReset.Name = "buttonReset";
			this.buttonReset.Size = new System.Drawing.Size(153, 34);
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
			this.comboBoxVersion.Location = new System.Drawing.Point(284, 37);
			this.comboBoxVersion.Margin = new System.Windows.Forms.Padding(0);
			this.comboBoxVersion.Name = "comboBoxVersion";
			this.comboBoxVersion.Size = new System.Drawing.Size(151, 24);
			this.comboBoxVersion.TabIndex = 5;
			// 
			// checkBoxForceVersion
			// 
			this.checkBoxForceVersion.Anchor = System.Windows.Forms.AnchorStyles.Left;
			this.checkBoxForceVersion.AutoSize = true;
			this.checkBoxForceVersion.Location = new System.Drawing.Point(284, 14);
			this.checkBoxForceVersion.Margin = new System.Windows.Forms.Padding(0);
			this.checkBoxForceVersion.Name = "checkBoxForceVersion";
			this.checkBoxForceVersion.Size = new System.Drawing.Size(116, 21);
			this.checkBoxForceVersion.TabIndex = 6;
			this.checkBoxForceVersion.Text = "Force version";
			this.checkBoxForceVersion.UseVisualStyleBackColor = true;
			this.checkBoxForceVersion.CheckedChanged += new System.EventHandler(this.checkBoxForceVersion_CheckedChanged);
			// 
			// buttonTrayOptions
			// 
			this.buttonTrayOptions.Location = new System.Drawing.Point(283, 67);
			this.buttonTrayOptions.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
			this.buttonTrayOptions.Name = "buttonTrayOptions";
			this.buttonTrayOptions.Size = new System.Drawing.Size(152, 34);
			this.buttonTrayOptions.TabIndex = 9;
			this.buttonTrayOptions.Text = "Tray Options";
			this.buttonTrayOptions.UseVisualStyleBackColor = true;
			this.buttonTrayOptions.Click += new System.EventHandler(this.buttonTrayOptions_Click);
			// 
			// OptionsForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(448, 199);
			this.Controls.Add(this.buttonTrayOptions);
			this.Controls.Add(this.checkBoxForceVersion);
			this.Controls.Add(this.comboBoxVersion);
			this.Controls.Add(this.buttonReset);
			this.Controls.Add(this.checkBoxTestingDomains);
			this.Controls.Add(this.groupBox1);
			this.Controls.Add(this.buttonCancel);
			this.Controls.Add(this.buttonSave);
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
			this.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
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
		private System.Windows.Forms.Button buttonTrayOptions;
	}
}