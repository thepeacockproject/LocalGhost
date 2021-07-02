// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	public static class v1_16
	{
		public static void addVersions()
		{
			HitmanVersion.addVersion("1.16.0.0_dx11", 0x5F8D62C5, v1_16_0_dx11); // epic
		}

		private static HitmanVersion v1_16_0_dx11 = new HitmanVersion()
		{
			certpin = new[] { new Patch(0x0CD9FCC, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x09C7815, "0F84B3000000", "909090909090", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x09C7825, "0F84A3000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x273A548, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[]
			{
				new Patch(0x14DB678, "68", "61", MemProtection.PAGE_READONLY) // this is just stupid
			},
			dynres_noforceoffline = new[] { new Patch(0x273A9C8, "01", "00", MemProtection.PAGE_READWRITE) }
		};
	}
}
