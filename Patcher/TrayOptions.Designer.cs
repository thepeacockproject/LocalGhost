
namespace HitmanPatcher
{
	partial class TrayOptions
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
			this.domainsBox = new System.Windows.Forms.RichTextBox();
			this.label1 = new System.Windows.Forms.Label();
			this.startBox = new System.Windows.Forms.CheckBox();
			this.minBox = new System.Windows.Forms.CheckBox();
			this.saveButton = new System.Windows.Forms.Button();
			this.cancelButton = new System.Windows.Forms.Button();
			this.SuspendLayout();
			// 
			// domainsBox
			// 
			this.domainsBox.Location = new System.Drawing.Point(12, 25);
			this.domainsBox.Name = "domainsBox";
			this.domainsBox.Size = new System.Drawing.Size(139, 94);
			this.domainsBox.TabIndex = 0;
			this.domainsBox.Text = "";
			// 
			// label1
			// 
			this.label1.AutoSize = true;
			this.label1.Location = new System.Drawing.Point(12, 6);
			this.label1.Name = "label1";
			this.label1.Size = new System.Drawing.Size(140, 13);
			this.label1.TabIndex = 1;
			this.label1.Text = "Domains (Enter one per line)";
			// 
			// startBox
			// 
			this.startBox.AutoSize = true;
			this.startBox.Location = new System.Drawing.Point(157, 41);
			this.startBox.Name = "startBox";
			this.startBox.Size = new System.Drawing.Size(79, 17);
			this.startBox.TabIndex = 2;
			this.startBox.Text = "Start in tray";
			this.startBox.UseVisualStyleBackColor = true;
			// 
			// minBox
			// 
			this.minBox.AutoSize = true;
			this.minBox.Location = new System.Drawing.Point(157, 64);
			this.minBox.Name = "minBox";
			this.minBox.Size = new System.Drawing.Size(98, 17);
			this.minBox.TabIndex = 3;
			this.minBox.Text = "Minimize to tray";
			this.minBox.UseVisualStyleBackColor = true;
			// 
			// saveButton
			// 
			this.saveButton.Location = new System.Drawing.Point(157, 96);
			this.saveButton.Name = "saveButton";
			this.saveButton.Size = new System.Drawing.Size(56, 23);
			this.saveButton.TabIndex = 4;
			this.saveButton.Text = "Save";
			this.saveButton.UseVisualStyleBackColor = true;
			this.saveButton.Click += new System.EventHandler(this.saveButton_Click);
			// 
			// cancelButton
			// 
			this.cancelButton.Location = new System.Drawing.Point(218, 96);
			this.cancelButton.Name = "cancelButton";
			this.cancelButton.Size = new System.Drawing.Size(56, 23);
			this.cancelButton.TabIndex = 5;
			this.cancelButton.Text = "Cancel";
			this.cancelButton.UseVisualStyleBackColor = true;
			this.cancelButton.Click += new System.EventHandler(this.cancelButton_Click);
			// 
			// TrayOptions
			// 
			this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
			this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
			this.ClientSize = new System.Drawing.Size(281, 133);
			this.Controls.Add(this.cancelButton);
			this.Controls.Add(this.saveButton);
			this.Controls.Add(this.minBox);
			this.Controls.Add(this.startBox);
			this.Controls.Add(this.label1);
			this.Controls.Add(this.domainsBox);
			this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
			this.Name = "TrayOptions";
			this.Text = "Tray Options";
			this.ResumeLayout(false);
			this.PerformLayout();

		}

		#endregion

		private System.Windows.Forms.RichTextBox domainsBox;
		private System.Windows.Forms.Label label1;
		private System.Windows.Forms.CheckBox startBox;
		private System.Windows.Forms.CheckBox minBox;
		private System.Windows.Forms.Button saveButton;
		private System.Windows.Forms.Button cancelButton;
	}
}