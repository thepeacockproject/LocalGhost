// Copyright (C) 2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	public static class v3_160
	{
		public static void addVersions()
		{
			HitmanVersion.addVersion("3.160.0.0_epic_dx12", 0x64ACBB67, v3_160_0_epic_dx12);
		}

		private static HitmanVersion v3_160_0_epic_dx12 = new HitmanVersion()
		{
			certpin = new[] { new Patch(0x0FE617D, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0C97DAD, "0F85B5000000", "909090909090", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0C97E93, "0F84B8000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x3C5AC48, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[] {
				new Patch(0x1EEA920, Patch.https, Patch.http, MemProtection.PAGE_READONLY),
				new Patch(0x0CA98E9, "0B", "0A", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0CA99CF, "0B", "0A", MemProtection.PAGE_EXECUTE_READ),
			},
			dynres_noforceoffline = new[] { new Patch(0x3C5AEA0, "01", "00", MemProtection.PAGE_EXECUTE_READWRITE) }
		};
	}
}
