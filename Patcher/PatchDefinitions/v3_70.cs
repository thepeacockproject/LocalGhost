﻿// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
	public static class v3_70
	{
		public static void addVersions()
		{
			HitmanVersion.addVersion("3.70.0.0_dx12", 0x614B0237, v3_70_0_dx12);
		}

		private static HitmanVersion v3_70_0_dx12 = new HitmanVersion()
		{
			certpin = new[] { new Patch(0x0FA9DAD, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
			authheader = new[]
			{
				new Patch(0x0C6A3FD, "0F85B5000000", "909090909090", MemProtection.PAGE_EXECUTE_READ),
				new Patch(0x0C6A4E3, "0F84B8000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
			},
			configdomain = new[] { new Patch(0x3B22198, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
			protocol = new[]
			{
				new Patch(0x1E77550, "68", "61", MemProtection.PAGE_READONLY) // dont ask me why this works
			},
			dynres_noforceoffline = new[] { new Patch(0x3B22B18, "01", "00", MemProtection.PAGE_EXECUTE_READWRITE) }
		};
	}
}
