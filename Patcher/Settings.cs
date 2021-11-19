// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HitmanPatcher
{

	public class Settings
	{
		public MemoryPatcher.Options patchOptions;
		public bool showTestingDomains;
		public bool startInTray;
		public bool minToTray;
		public string[] trayDomains;

		private static string localpath = "patcher.conf";
		private static string appdatapath =
			Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "LocalGhost", "patcher.conf");

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
			this.showTestingDomains = false;
			this.startInTray = false;
			this.minToTray = false;
			this.trayDomains = new string[] { };
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
			lines.Add(String.Format("showTestingDomains={0}", showTestingDomains));
			lines.Add(String.Format("startInTray={0}", startInTray));
			lines.Add(String.Format("minToTray={0}", minToTray));
			lines.Add(String.Format("trayDomains={0}", string.Join(",", trayDomains)));

			File.WriteAllLines(path, lines);
		}

		public static Settings getFromFile(string path)
		{
			Settings result = new Settings();
			if (File.Exists(path))
			{
				string[] lines = File.ReadAllLines(path);
				if (lines.Length == 1)
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
							case "showTestingDomains":
								result.showTestingDomains = Boolean.Parse(linecontents[1]);
								break;
							case "startInTray":
								result.startInTray = Boolean.Parse(linecontents[1]);
								break;
							case "minToTray":
								result.minToTray = Boolean.Parse(linecontents[1]);
								break;
							case "trayDomains":
								result.trayDomains = linecontents[1] == "" ? new string[0] : linecontents[1].Split(new char[] { ',' });
								break;
						}
					}
				}
			}

			result.saveToFile(path);
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
