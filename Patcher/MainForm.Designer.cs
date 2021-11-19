// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	partial class MainForm
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
			this.components = new System.ComponentModel.Container();
			System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
			this.label1 = new System.Windows.Forms.Label();
			this.listView1 = new System.Windows.Forms.ListView();
			this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
			this.logContextMenu = new System.Windows.Forms.ContextMenuStrip(this.components);
			this.copyLogToClipboardToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
			this.label2 = new System.Windows.Forms.Label();
			this.buttonRepatch = new System.Windows.Forms.Button();
			this.comboBox1 = new System.Windows.Forms.ComboBox();
			this.linkLabel1 = new System.Windows.Forms.LinkLabel();
			this.button2 = new System.Windows.Forms.Button();
			this.buttonOptions = new System.Windows.Forms.Button();
			this.trayIcon = new System.Windows.Forms.NotifyIcon(this.components);
			this.trayMenu = new System.Windows.Forms.ContextMenuStrip(this.components);
			this.menuItemOpen = new System.Windows.Forms.ToolStripMenuItem();
			this.menuItemRepatch = new System.Windows.Forms.ToolStripMenuItem();
			this.domainsTrayMenu = new System.Windows.Forms.ToolStripMenuItem();
			this.menuItemExit = new System.Windows.Forms.ToolStripMenuItem();
			this.logContextMenu.SuspendLayout();
			this.trayMenu.SuspendLayout();
			this.SuspendLayout();
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(12, 15);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(109, 17);
			this.label1.TabIndex = 0;
			this.label1.Text = "Server address:";
			// 
			// listView1
			// 
			this.listView1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.listView1.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader1});
			this.listView1.ContextMenuStrip = this.logContextMenu;
			this.listView1.FullRowSelect = true;
			this.listView1.HeaderStyle = System.Windows.Forms.ColumnHeaderStyle.None;
			this.listView1.HideSelection = false;
			this.listView1.Location = new System.Drawing.Point(0, 81);
			this.listView1.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.listView1.Name = "listView1";
			this.listView1.Size = new System.Drawing.Size(432, 106);
			this.listView1.TabIndex = 2;
			this.listView1.UseCompatibleStateImageBehavior = false;
			this.listView1.View = System.Windows.Forms.View.Details;
			// 
			// columnHeader1
			// 
			this.columnHeader1.Width = 300;
			// 
			// logContextMenu
			// 
			this.logContextMenu.ImageScalingSize = new System.Drawing.Size(20, 20);
			this.logContextMenu.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.copyLogToClipboardToolStripMenuItem});
			this.logContextMenu.Name = "logContextMenu";
			this.logContextMenu.Size = new System.Drawing.Size(225, 28);
			// 
			// copyLogToClipboardToolStripMenuItem
			// 
			this.copyLogToClipboardToolStripMenuItem.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
			this.copyLogToClipboardToolStripMenuItem.Name = "copyLogToClipboardToolStripMenuItem";
			this.copyLogToClipboardToolStripMenuItem.Size = new System.Drawing.Size(224, 24);
			this.copyLogToClipboardToolStripMenuItem.Text = "&Copy log to clipboard";
			this.copyLogToClipboardToolStripMenuItem.Click += new System.EventHandler(this.copyLogToClipboardToolStripMenuItem_Click);
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point(12, 62);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(36, 17);
			this.label2.TabIndex = 3;
			this.label2.Text = "Log:";
			// 
			// buttonRepatch
			// 
			this.buttonRepatch.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.buttonRepatch.Location = new System.Drawing.Point(373, 1);
			this.buttonRepatch.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.buttonRepatch.Name = "buttonRepatch";
			this.buttonRepatch.Size = new System.Drawing.Size(59, 44);
			this.buttonRepatch.TabIndex = 4;
			this.buttonRepatch.Text = "&Re-\r\npatch";
			this.buttonRepatch.UseVisualStyleBackColor = true;
			this.buttonRepatch.Click += new System.EventHandler(this.buttonRepatch_Click);
			// 
			// comboBox1
			// 
			this.comboBox1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.comboBox1.FormattingEnabled = true;
			this.comboBox1.Location = new System.Drawing.Point(127, 12);
			this.comboBox1.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.comboBox1.MaxLength = 150;
			this.comboBox1.Name = "comboBox1";
			this.comboBox1.Size = new System.Drawing.Size(240, 24);
			this.comboBox1.TabIndex = 5;
			// 
			// linkLabel1
			// 
			this.linkLabel1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
			this.linkLabel1.AutoSize = true;
			this.linkLabel1.Location = new System.Drawing.Point(173, 202);
			this.linkLabel1.Name = "linkLabel1";
			this.linkLabel1.Size = new System.Drawing.Size(247, 17);
			this.linkLabel1.TabIndex = 6;
			this.linkLabel1.TabStop = true;
			this.linkLabel1.Text = "LocalGhost - Made by grappigegovert";
			this.linkLabel1.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel1_LinkClicked);
			// 
			// button2
			// 
			this.button2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.button2.Location = new System.Drawing.Point(12, 196);
			this.button2.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.button2.Name = "button2";
			this.button2.Size = new System.Drawing.Size(109, 28);
			this.button2.TabIndex = 7;
			this.button2.Text = "Start Hitman 2";
			this.button2.UseVisualStyleBackColor = true;
			this.button2.Click += new System.EventHandler(this.button2_Click);
			// 
			// buttonOptions
			// 
			this.buttonOptions.Anchor = System.Windows.Forms.AnchorStyles.Top;
			this.buttonOptions.Location = new System.Drawing.Point(165, 42);
			this.buttonOptions.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.buttonOptions.Name = "buttonOptions";
			this.buttonOptions.Size = new System.Drawing.Size(161, 33);
			this.buttonOptions.TabIndex = 8;
			this.buttonOptions.Text = "Advanced &Options";
			this.buttonOptions.UseVisualStyleBackColor = true;
			this.buttonOptions.Click += new System.EventHandler(this.buttonOptions_Click);
			// 
			// trayIcon
			// 
			this.trayIcon.ContextMenuStrip = this.trayMenu;
			this.trayIcon.Icon = ((System.Drawing.Icon)(resources.GetObject("trayIcon.Icon")));
			this.trayIcon.Text = "LocalGhost Patcher";
			this.trayIcon.MouseDoubleClick += new System.Windows.Forms.MouseEventHandler(this.menuItemOpen_Click);
			// 
			// trayMenu
			// 
			this.trayMenu.ImageScalingSize = new System.Drawing.Size(20, 20);
			this.trayMenu.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.menuItemOpen,
            this.menuItemRepatch,
            this.domainsTrayMenu,
            this.menuItemExit});
			this.trayMenu.Name = "trayMenu";
			this.trayMenu.Size = new System.Drawing.Size(176, 128);
			// 
			// menuItemOpen
			// 
			this.menuItemOpen.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
			this.menuItemOpen.Name = "menuItemOpen";
			this.menuItemOpen.Size = new System.Drawing.Size(175, 24);
			this.menuItemOpen.Text = "&Open";
			this.menuItemOpen.Click += new System.EventHandler(this.menuItemOpen_Click);
			// 
			// menuItemRepatch
			// 
			this.menuItemRepatch.Name = "menuItemRepatch";
			this.menuItemRepatch.Size = new System.Drawing.Size(175, 24);
			this.menuItemRepatch.Text = "&Re-patch";
			this.menuItemRepatch.Click += new System.EventHandler(this.buttonRepatch_Click);
			// 
			// domainsTrayMenu
			// 
			this.domainsTrayMenu.Name = "domainsTrayMenu";
			this.domainsTrayMenu.Size = new System.Drawing.Size(175, 24);
			this.domainsTrayMenu.Text = "Set &Domain";
			// 
			// menuItemExit
			// 
			this.menuItemExit.Name = "menuItemExit";
			this.menuItemExit.Size = new System.Drawing.Size(175, 24);
			this.menuItemExit.Text = "&Exit";
			this.menuItemExit.Click += new System.EventHandler(this.menuItemExit_Click);
			// 
			// MainForm
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(432, 233);
			this.Controls.Add(this.buttonOptions);
			this.Controls.Add(this.button2);
			this.Controls.Add(this.linkLabel1);
			this.Controls.Add(this.comboBox1);
			this.Controls.Add(this.buttonRepatch);
			this.Controls.Add(this.label2);
			this.Controls.Add(this.listView1);
			this.Controls.Add(this.label1);
			this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
			this.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
			this.MaximizeBox = false;
			this.MinimumSize = new System.Drawing.Size(423, 238);
			this.Name = "MainForm";
			this.Text = "LocalGhost Patcher";
			this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.MainForm_FormClosing);
			this.Resize += new System.EventHandler(this.MainForm_Resize);
			this.logContextMenu.ResumeLayout(false);
			this.trayMenu.ResumeLayout(false);
			this.ResumeLayout(false);
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.ListView listView1;
		private System.Windows.Forms.ColumnHeader columnHeader1;
		private System.Windows.Forms.Label label2;
		private System.Windows.Forms.Button buttonRepatch;
		private System.Windows.Forms.ComboBox comboBox1;
		private System.Windows.Forms.LinkLabel linkLabel1;
		private System.Windows.Forms.Button button2;
		private System.Windows.Forms.Button buttonOptions;
		private System.Windows.Forms.ContextMenuStrip logContextMenu;
		private System.Windows.Forms.ToolStripMenuItem copyLogToClipboardToolStripMenuItem;
		private System.Windows.Forms.NotifyIcon trayIcon;
		private System.Windows.Forms.ContextMenuStrip trayMenu;
		private System.Windows.Forms.ToolStripMenuItem menuItemExit;
		private System.Windows.Forms.ToolStripMenuItem menuItemRepatch;
		private System.Windows.Forms.ToolStripMenuItem domainsTrayMenu;
		private System.Windows.Forms.ToolStripMenuItem menuItemOpen;
	}
}

