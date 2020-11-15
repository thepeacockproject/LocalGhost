// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.Remoting.Metadata.W3cXsd2001;
using System.Text;

namespace Hitman2Patcher
{
	class Hitman2Version
	{
		public Patch[] certpin, authheader, configdomain, protocol;

		private Hitman2Version()
		{

		}

		public class Patch
		{
			public int offset;
			public byte[] original, patch;
			public string customPatch;
			public MemProtection defaultProtection;

			public Patch(int offset, byte[] original, byte[] patch, MemProtection defaultProtection, string customPatch = "")
			{
				this.offset = offset;
				this.original = original;
				this.patch = patch;
				this.defaultProtection = defaultProtection;
				this.customPatch = customPatch;
			}

			public Patch(int offset, string original, string patch, MemProtection defaultProtection, string customPatch = "")
				: this(offset, SoapHexBinary.Parse(original).Value, SoapHexBinary.Parse(patch).Value, defaultProtection, customPatch)
			{

			}
		}

		private static string versionStringFromTimestamp(UInt32 timestamp)
		{
			switch (timestamp)
			{
				case 0x5EE9D065:
					return "2.72.0.0-h4_dx11";
				case 0x5EE9D095:
					return "2.72.0.0-h4_dx12";
				default:
					return "unknown";
			}
		}

		public static Hitman2Version getVersion(UInt32 timestamp, string versionString = "")
		{
			if (versionString == "")
			{
				versionString = versionStringFromTimestamp(timestamp);
			}

			Hitman2Version version;
			if (versionMap.TryGetValue(versionString, out version))
			{
				return version;
			}

			throw new NotImplementedException();
		}

		private static readonly byte[] http = Encoding.ASCII.GetBytes("http://{0}\0").ToArray();
		private static readonly byte[] https = Encoding.ASCII.GetBytes("https://{0}\0").ToArray();

		public static Hitman2Version v2_72_0_h4_dx11 = new Hitman2Version()
		{
			certpin = new[] { new Patch(0x0F33363, "75", "EB", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0B5A1F8, "75", "EB", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0B5A21C, "0F8486000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x2BBBC08, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[]
			{
				new Patch(0x182D598, https, http, MemProtection.PAGE_READONLY),
				new Patch(0x0B4ED64, "0C", "0B", MemProtection.PAGE_EXECUTE_READ)
			}
		};

		public static Hitman2Version v2_72_0_h4_dx12 = new Hitman2Version()
		{
			certpin = new[] { new Patch(0x0F32EC3, "75", "EB", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0B59D58, "75", "EB", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0B59D7C, "0F8486000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x2BDA208, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[]
			{
				new Patch(0x18486B8, https, http, MemProtection.PAGE_READONLY),
				new Patch(0x0B4E8C4, "0C", "0B", MemProtection.PAGE_EXECUTE_READ)
			}
		};

		private static Dictionary<string, Hitman2Version> versionMap = new Dictionary<string, Hitman2Version>()
		{
			{"2.72.0.0-h4_dx11", v2_72_0_h4_dx11},
			{"2.72.0.0-h4_dx12", v2_72_0_h4_dx12},
		};
	}
}