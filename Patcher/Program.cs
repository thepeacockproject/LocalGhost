// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Security.Principal;
using System.Windows.Forms;

namespace HitmanPatcher
{
	static class Program
	{
		/// <summary>
		/// The main entry point for the application.
		/// </summary>
		[STAThread]
		static void Main()
		{
			Application.EnableVisualStyles();
			Application.SetCompatibleTextRenderingDefault(false);
			WindowsIdentity identity = WindowsIdentity.GetCurrent();
			WindowsPrincipal principal = new WindowsPrincipal(identity);
			if (!principal.IsInRole(WindowsBuiltInRole.Administrator))
			{
				const int ERROR_CANCELLED = 1223; //The operation was canceled by the user.

				ProcessStartInfo info = new ProcessStartInfo(Environment.GetCommandLineArgs()[0]);
				info.Verb = "runas";
				try
				{
					Process.Start(info);
				}
				catch (Win32Exception ex)
				{
					if (ex.NativeErrorCode != ERROR_CANCELLED)
					{
						throw;
					}
					MessageBox.Show("This patcher must be run with administrator privileges to work", "Error");
				}
				return;
			}
			Application.Run(new Form1());
		}
	}
}
