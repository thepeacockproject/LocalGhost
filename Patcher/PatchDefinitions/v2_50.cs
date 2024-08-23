// Copyright (C) 2024 AnthonyFuller <anthony@hitmods.com>
// Copyright (C) 2024 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
    public static class v2_50
    {
        public static void addVersions()
        {
            HitmanVersion.addVersion("2.50.3.0_dx11", 0x5D44098A, v2_50_3_dx11);
            HitmanVersion.addVersion("2.50.3.0_dx12", 0x5D440B4D, v2_50_3_dx12);
        }

        private static HitmanVersion v2_50_3_dx11 = new HitmanVersion()
        {
            certpin = new[] { new Patch(0xF424CC, "75", "EB", MemProtection.PAGE_EXECUTE_READ) },
            authheader = new[]
            {
                new Patch(0xB7B0D7, "75", "EB", MemProtection.PAGE_EXECUTE_READ),
                new Patch(0xB7B0FB, "0F8486000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
            },
            configdomain = new[] { new Patch(0x2C11AE8, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
            protocol = new[]
            {
                new Patch(0x18547C8, Patch.https, Patch.http, MemProtection.PAGE_READONLY),
                new Patch(0xB6FAB4, "0C", "0B", MemProtection.PAGE_EXECUTE_READ)
            },
            dynres_noforceoffline = new[] { new Patch(0x2C123E8, "01", "00", MemProtection.PAGE_READWRITE) }
        };

        public static HitmanVersion v2_50_3_dx12 = new HitmanVersion()
        {
            certpin = new[] { new Patch(0xF40E7C, "75", "EB", MemProtection.PAGE_EXECUTE_READ) },
            authheader = new[]
            {
                new Patch(0xB788A7, "75", "EB", MemProtection.PAGE_EXECUTE_READ),
                new Patch(0xB788CB, "0F8486000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
            },
            configdomain = new[] { new Patch(0x2C22148, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
            protocol = new[]
            {
                new Patch(0x1863838, Patch.https, Patch.http, MemProtection.PAGE_READONLY),
                new Patch(0xB6D284, "0C", "0B", MemProtection.PAGE_EXECUTE_READ)
            },
            dynres_noforceoffline = new[] { new Patch(0x2C22A48, "01", "00", MemProtection.PAGE_EXECUTE_READWRITE) }
        };
    }
}