using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Security.Principal;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Hitman2Patcher
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
