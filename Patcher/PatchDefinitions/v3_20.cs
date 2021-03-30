// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace Hitman2Patcher
{
	public static class v3_20
	{
		public static void addVersions()
		{
			Hitman2Version.addVersion("3.20.0.0_dx12", 0x604FB467, v3_20_0_dx12);
		}

		private static Hitman2Version v3_20_0_dx12 = new Hitman2Version()
		{
			certpin = new[] { new Patch(0x0CAC72E, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0A1AF77, "75", "EB", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0A1AF9B, "0F8482000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x2AC4688, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[]
			{
				new Patch(0x195F9D8, Patch.https, Patch.http, MemProtection.PAGE_READONLY),
				new Patch(0x0A0FBE4, "0C", "0B", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0A3F4E0, "0C", "0B", MemProtection.PAGE_EXECUTE_READ)
			},
			dynres_noforceoffline = new[] { new Patch(0x2AC5008, "01", "00", MemProtection.PAGE_EXECUTE_READWRITE) }
		};
	}
}
