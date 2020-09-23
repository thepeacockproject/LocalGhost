using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;

namespace Hitman2Patcher
{
	class Hitman2Version
	{
		public int certpin, auth1, auth2, url1, url2, protocol1, protocol2;

		private Hitman2Version()
		{

		}

		public static Hitman2Version getVersion(Process process)
		{
			string foldername = Path.GetFileName(Path.GetDirectoryName(process.MainModule.FileName)).ToLower();
			if (foldername == "retail")
			{
				switch (process.MainModule.FileVersionInfo.FileVersion)
				{
					case "2.72.0.0":
						return v2_72_0_dx11;
				}
			}
			else if (foldername == "dx12retail")
			{
				switch (process.MainModule.FileVersionInfo.FileVersion)
				{
					case "2.72.0.0":
						return v2_72_0_dx12;
				}
			}
			throw new NotImplementedException();		
		}

		public static Hitman2Version v2_72_0_dx11 = new Hitman2Version()
		{
			certpin = 0x0F33363,
			auth1 = 0x0B5A1F8,
			auth2 = 0x0B5A21C,
			url1 = 0x1824E40,
			url2 = 0x2BBBC08,
			protocol1 = 0x182D598,
			protocol2 = 0x0B4ED64
		};

		public static Hitman2Version v2_72_0_dx12 = new Hitman2Version()
		{
			certpin = 0x0F32EC3,
			auth1 = 0x0B59D58,
			auth2 = 0x0B59D7C,
			url1 = 0x183FF60,
			url2 = 0x2BDA208,
			protocol1 = 0x18486B8,
			protocol2 = 0x0B4E8C4
		};
	}
}
