﻿// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	public static class v2_13
	{
		public static void addVersions()
		{
			HitmanVersion.addVersion("2.13.0.0-h2_dx11", 0x5C49A4CB, v2_13_0_h2_dx11);
		}

		private static HitmanVersion v2_13_0_h2_dx11 = new HitmanVersion()
		{
			certpin = new[] { new Patch(0xEED662, "75", "EB", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0B3A157, "75", "EB", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0B3A17B, "0F8483000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x2BAAE88, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[]
			{
				new Patch(0x17FE770, Patch.https, Patch.http, MemProtection.PAGE_READONLY),
				new Patch(0x0B2F5B8, "0C", "0B", MemProtection.PAGE_EXECUTE_READ)
			},
			dynres_noforceoffline = new[] { new Patch(0x2BAB608, "01", "00", MemProtection.PAGE_READWRITE) }
		};
	}
}
