// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	partial class Form1
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
			System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
			this.label1 = new System.Windows.Forms.Label();
			this.listView1 = new System.Windows.Forms.ListView();
			this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
			this.logContextMenu = new System.Windows.Forms.ContextMenuStrip(this.components);
			this.copyLogToClipboardToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
			this.label2 = new System.Windows.Forms.Label();
			this.button1 = new System.Windows.Forms.Button();
			this.comboBox1 = new System.Windows.Forms.ComboBox();
			this.linkLabel1 = new System.Windows.Forms.LinkLabel();
			this.button2 = new System.Windows.Forms.Button();
			this.button3 = new System.Windows.Forms.Button();
			this.trayIcon = new System.Windows.Forms.NotifyIcon(this.components);
			this.trayMenu = new System.Windows.Forms.ContextMenuStrip(this.components);
			this.repatchMenuItem = new System.Windows.Forms.ToolStripMenuItem();
			this.domainsTrayMenu = new System.Windows.Forms.ToolStripMenuItem();
			this.exitTrayMenu = new System.Windows.Forms.ToolStripMenuItem();
			this.logContextMenu.SuspendLayout();
			this.trayMenu.SuspendLayout();
			this.SuspendLayout();
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(9, 12);
			this.label1.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(81, 13);
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
			this.listView1.Location = new System.Drawing.Point(0, 66);
			this.listView1.Margin = new System.Windows.Forms.Padding(2);
			this.listView1.Name = "listView1";
			this.listView1.Size = new System.Drawing.Size(325, 87);
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
			this.logContextMenu.Size = new System.Drawing.Size(190, 26);
			// 
			// copyLogToClipboardToolStripMenuItem
			// 
			this.copyLogToClipboardToolStripMenuItem.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
			this.copyLogToClipboardToolStripMenuItem.Name = "copyLogToClipboardToolStripMenuItem";
			this.copyLogToClipboardToolStripMenuItem.Size = new System.Drawing.Size(189, 22);
			this.copyLogToClipboardToolStripMenuItem.Text = "Copy log to clipboard";
			this.copyLogToClipboardToolStripMenuItem.Click += new System.EventHandler(this.copyLogToClipboardToolStripMenuItem_Click);
			// 
			// label2
			// 
			this.label2.AutoSize = true;
			this.label2.Location = new System.Drawing.Point(9, 50);
			this.label2.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
			this.label2.Name = "label2";
			this.label2.Size = new System.Drawing.Size(28, 13);
			this.label2.TabIndex = 3;
			this.label2.Text = "Log:";
			// 
			// button1
			// 
			this.button1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
			this.button1.Location = new System.Drawing.Point(280, 1);
			this.button1.Margin = new System.Windows.Forms.Padding(2);
			this.button1.Name = "button1";
			this.button1.Size = new System.Drawing.Size(44, 36);
			this.button1.TabIndex = 4;
			this.button1.Text = "Re-\r\npatch";
			this.button1.UseVisualStyleBackColor = true;
			this.button1.Click += new System.EventHandler(this.button1_Click);
			// 
			// comboBox1
			// 
			this.comboBox1.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
			this.comboBox1.FormattingEnabled = true;
			this.comboBox1.Location = new System.Drawing.Point(95, 10);
			this.comboBox1.Margin = new System.Windows.Forms.Padding(2);
			this.comboBox1.MaxLength = 150;
			this.comboBox1.Name = "comboBox1";
			this.comboBox1.Size = new System.Drawing.Size(181, 21);
			this.comboBox1.TabIndex = 5;
			// 
			// linkLabel1
			// 
			this.linkLabel1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
			this.linkLabel1.AutoSize = true;
			this.linkLabel1.Location = new System.Drawing.Point(130, 164);
			this.linkLabel1.Margin = new System.Windows.Forms.Padding(2, 0, 2, 0);
			this.linkLabel1.Name = "linkLabel1";
			this.linkLabel1.Size = new System.Drawing.Size(185, 13);
			this.linkLabel1.TabIndex = 6;
			this.linkLabel1.TabStop = true;
			this.linkLabel1.Text = "LocalGhost - Made by grappigegovert";
			this.linkLabel1.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel1_LinkClicked);
			// 
			// button2
			// 
			this.button2.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
			this.button2.Location = new System.Drawing.Point(9, 159);
			this.button2.Margin = new System.Windows.Forms.Padding(2);
			this.button2.Name = "button2";
			this.button2.Size = new System.Drawing.Size(82, 23);
			this.button2.TabIndex = 7;
			this.button2.Text = "Start Hitman 2";
			this.button2.UseVisualStyleBackColor = true;
			this.button2.Click += new System.EventHandler(this.button2_Click);
			// 
			// button3
			// 
			this.button3.Anchor = System.Windows.Forms.AnchorStyles.Top;
			this.button3.Location = new System.Drawing.Point(124, 34);
			this.button3.Margin = new System.Windows.Forms.Padding(2);
			this.button3.Name = "button3";
			this.button3.Size = new System.Drawing.Size(121, 27);
			this.button3.TabIndex = 8;
			this.button3.Text = "Advanced Options";
			this.button3.UseVisualStyleBackColor = true;
			this.button3.Click += new System.EventHandler(this.button3_Click);
			// 
			// trayIcon
			// 
			this.trayIcon.ContextMenuStrip = this.trayMenu;
			this.trayIcon.Icon = ((System.Drawing.Icon)(resources.GetObject("trayIcon.Icon")));
			this.trayIcon.Text = "LocalGhost Patcher";
			this.trayIcon.MouseDoubleClick += new System.Windows.Forms.MouseEventHandler(this.trayIcon_MouseDoubleClick);
			// 
			// trayMenu
			// 
			this.trayMenu.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.repatchMenuItem,
            this.domainsTrayMenu,
            this.exitTrayMenu});
			this.trayMenu.Name = "trayMenu";
			this.trayMenu.Size = new System.Drawing.Size(181, 92);
			// 
			// repatchMenuItem
			// 
			this.repatchMenuItem.Name = "repatchMenuItem";
			this.repatchMenuItem.Size = new System.Drawing.Size(180, 22);
			this.repatchMenuItem.Text = "Re-patch";
			this.repatchMenuItem.Click += new System.EventHandler(this.repatchMenuItem_Click);
			// 
			// domainsTrayMenu
			// 
			this.domainsTrayMenu.Name = "domainsTrayMenu";
			this.domainsTrayMenu.Size = new System.Drawing.Size(180, 22);
			this.domainsTrayMenu.Text = "Set Domain";
			// 
			// exitTrayMenu
			// 
			this.exitTrayMenu.Name = "exitTrayMenu";
			this.exitTrayMenu.Size = new System.Drawing.Size(180, 22);
			this.exitTrayMenu.Text = "Exit";
			this.exitTrayMenu.Click += new System.EventHandler(this.exitTrayMenu_Click);
			// 
			// Form1
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(324, 189);
			this.Controls.Add(this.button3);
			this.Controls.Add(this.button2);
			this.Controls.Add(this.linkLabel1);
			this.Controls.Add(this.comboBox1);
			this.Controls.Add(this.button1);
			this.Controls.Add(this.label2);
			this.Controls.Add(this.listView1);
			this.Controls.Add(this.label1);
			this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
			this.Margin = new System.Windows.Forms.Padding(2);
			this.MaximizeBox = false;
			this.MinimumSize = new System.Drawing.Size(322, 202);
			this.Name = "Form1";
			this.Text = "LocalGhost Patcher";
			this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_FormClosing);
			this.Resize += new System.EventHandler(this.Form1_Resize);
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
		private System.Windows.Forms.Button button1;
		private System.Windows.Forms.ComboBox comboBox1;
		private System.Windows.Forms.LinkLabel linkLabel1;
		private System.Windows.Forms.Button button2;
		private System.Windows.Forms.Button button3;
		private System.Windows.Forms.ContextMenuStrip logContextMenu;
		private System.Windows.Forms.ToolStripMenuItem copyLogToClipboardToolStripMenuItem;
		private System.Windows.Forms.NotifyIcon trayIcon;
		private System.Windows.Forms.ContextMenuStrip trayMenu;
		private System.Windows.Forms.ToolStripMenuItem exitTrayMenu;
		private System.Windows.Forms.ToolStripMenuItem repatchMenuItem;
		private System.Windows.Forms.ToolStripMenuItem domainsTrayMenu;
	}
}

