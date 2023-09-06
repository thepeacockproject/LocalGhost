// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HitmanPatcher
{

	public struct StartButtonPreset
	{
		public string Name;
		public string Text;
		public string Command;
	}

	public class Settings
	{
		public MemoryPatcher.Options patchOptions;
		public bool startInTray;
		public bool minimizeToTray;
		public List<string> domains;
		public int startButtonPreset;
		public string startButtonText;
		public string startButtonCommand;

		private static readonly string localpath = "patcher.conf";
		private static readonly string appdatapath =
			Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "LocalGhost", "patcher.conf");
		public static readonly StartButtonPreset[] startButtonPresets = new StartButtonPreset[] {
            new StartButtonPreset() { Name="Custom", Text="", Command="" },
            new StartButtonPreset() { Name="H2016 Steam", Text="Start Hitman 1", Command="steam://run/236870//" },
            new StartButtonPreset() { Name="H2016 EGL", Text="Start Hitman 1", Command="com.epicgames.launcher://apps/Barbet?action=launch&silent=true&args=" },
            new StartButtonPreset() { Name="H2016 Legendary", Text="Start Hitman 1", Command="legendary launch Barbet" },
            new StartButtonPreset() { Name="H2 Steam", Text="Start Hitman 2", Command="steam://run/863550//" },
            new StartButtonPreset() { Name="H3 Steam", Text="Start Hitman 3", Command="steam://run/1659040//" },
            new StartButtonPreset() { Name="H3 EGL", Text="Start Hitman 3", Command="com.epicgames.launcher://apps/Eider?action=launch&silent=true&args=" },
            new StartButtonPreset() { Name="H3 Legendary", Text="Start Hitman 3", Command="legendary launch Eider" },
            new StartButtonPreset() { Name="H3 Gamepass", Text="Start Hitman 3", Command=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "WindowsApps", "HITMAN3.exe") },
        };

		public Settings()
		{
			// Default settings
			this.patchOptions = new MemoryPatcher.Options
			{
				DisableCertPinning = false,
				AlwaysSendAuthHeader = true,
				SetCustomConfigDomain = true,
				CustomConfigDomain = "localhost",
				UseHttp = true,
				DisableForceOfflineOnFailedDynamicResources = true,
				ForcedVersion = ""
			};
			this.startInTray = false;
			this.minimizeToTray = false;
			this.domains = new List<string>();
			this.startButtonPreset = 5; // H3 steam
			this.startButtonCommand = Settings.startButtonPresets[5].Command;
			this.startButtonText = Settings.startButtonPresets[5].Text;
		}

		public void saveToFile(string path)
		{
			List<string> lines = new List<string>();
			lines.Add(String.Format("DisableCertPinning={0}", patchOptions.DisableCertPinning));
			lines.Add(String.Format("AlwaysSendAuthHeader={0}", patchOptions.AlwaysSendAuthHeader));
			lines.Add(String.Format("SetCustomConfigDomain={0}", patchOptions.SetCustomConfigDomain));
			lines.Add(String.Format("CustomConfigDomain={0}", patchOptions.CustomConfigDomain));
			lines.Add(String.Format("UseHttp={0}", patchOptions.UseHttp));
			lines.Add(String.Format("DisableForceOfflineOnFailedDynamicResources={0}", patchOptions.DisableForceOfflineOnFailedDynamicResources));
			lines.Add(String.Format("forcedVersion={0}", patchOptions.ForcedVersion));
			lines.Add(String.Format("startInTray={0}", startInTray));
			lines.Add(String.Format("minToTray={0}", minimizeToTray));
			lines.Add(String.Format("startButtonPreset={0}", startButtonPreset));
			lines.Add(String.Format("startButtonCommand={0}", startButtonCommand));
			lines.Add(String.Format("startButtonText={0}", startButtonText));

			foreach (string domain in domains)
			{
				lines.Add(String.Format("domain={0}", domain));
			}

			File.WriteAllLines(path, lines);
		}

		public static Settings getFromFile(string path)
		{
			Settings result = new Settings();
			if (File.Exists(path))
			{
				string[] lines = File.ReadAllLines(path);
				if (lines.Length == 1) // legacy
				{
					result.patchOptions.CustomConfigDomain = lines[0];
				}
				else
				{
					foreach (string line in lines)
					{
						if (line == "")
							continue;

						string[] linecontents = line.Split(new char[] { '=' }, 2);
						switch (linecontents[0])
						{
							case "DisableCertPinning":
								result.patchOptions.DisableCertPinning = Boolean.Parse(linecontents[1]);
								break;
							case "AlwaysSendAuthHeader":
								result.patchOptions.AlwaysSendAuthHeader = Boolean.Parse(linecontents[1]);
								break;
							case "SetCustomConfigDomain":
								result.patchOptions.SetCustomConfigDomain = Boolean.Parse(linecontents[1]);
								break;
							case "CustomConfigDomain":
								result.patchOptions.CustomConfigDomain = linecontents[1];
								break;
							case "UseHttp":
								result.patchOptions.UseHttp = Boolean.Parse(linecontents[1]);
								break;
							case "DisableForceOfflineOnFailedDynamicResources":
								result.patchOptions.DisableForceOfflineOnFailedDynamicResources = Boolean.Parse(linecontents[1]);
								break;
							case "forcedVersion":
								result.patchOptions.ForcedVersion = HitmanVersion.Versions.Contains(linecontents[1]) ? linecontents[1] : "";
								break;
							case "showTestingDomains": // legacy
								if (Boolean.Parse(linecontents[1]))
								{
									result.domains.Add("localhost");
									result.domains.Add("config.hitman.io");
								}
								break;
							case "startInTray":
								result.startInTray = Boolean.Parse(linecontents[1]);
								break;
							case "minToTray":
								result.minimizeToTray = Boolean.Parse(linecontents[1]);
								break;
							case "trayDomain": // legacy
								result.domains.Add(linecontents[1]);
								break;
							case "domain":
								result.domains.Add(linecontents[1]);
								break;
							case "startButtonPreset":
								result.startButtonPreset = Int32.Parse(linecontents[1]);
								break;
							case "startButtonCommand":
								result.startButtonCommand = linecontents[1];
								break;
							case "startButtonText":
								result.startButtonText = linecontents[1];
								break;
						}
					}
				}
				result.domains = result.domains.Where(d => !string.IsNullOrWhiteSpace(d)).ToList();
			}

			return result;
		}

		public static Settings Load()
		{
			if (File.Exists(appdatapath))
			{
				return getFromFile(appdatapath);
			}
			else
			{
				return getFromFile(localpath);
			}
		}

		public void Save()
		{
			string dir = Path.GetDirectoryName(appdatapath);
			if (!Directory.Exists(dir))
			{
				Directory.CreateDirectory(dir);
			}

			this.saveToFile(appdatapath);
		}
	}
}
