// Copyright (C) 2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	public static class v3_210
	{
		public static void addVersions()
		{
			HitmanVersion.addVersion("3.210.1.0_epic_dx12", 0x674F637C, v3_210_1_epic_dx12);
		}

		private static HitmanVersion v3_210_1_epic_dx12 = new HitmanVersion()
		{
			certpin = new[] { new Patch(0x0F01F9D, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0BF421C, "7508", "9090", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0BF4252, "0F84C2000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x2273358, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[] {
				new Patch(0x1DF8E70, Patch.https, Patch.http, MemProtection.PAGE_READONLY),
				new Patch(0x0C0634D, "0B", "0A", MemProtection.PAGE_EXECUTE_READ),
			},
			dynres_noforceoffline = new[] { new Patch(0x3B2D550, "01", "00", MemProtection.PAGE_EXECUTE_READWRITE) }
		};
	}
}
