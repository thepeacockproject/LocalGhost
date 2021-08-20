// Licensed under the zlib license. See LICENSE for more info

namespace HitmanPatcher
{
    public static class sniper_v1_0
    {
        public static void addVersions()
        {
            HitmanVersion.addVersion("sniper_1.0.1.0-h1_dx11", 0x5B31107D, sniper_v1_0_1_h1_dx11);
            HitmanVersion.addVersion("sniper_1.0.1.0-h1_dx12", 0x5B311189, sniper_v1_0_1_h1_dx12);
        }

        private static HitmanVersion sniper_v1_0_1_h1_dx11 = new HitmanVersion()
        {
            certpin = new[] { new Patch(0x0489840, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
            authheader = new[]
            {
                new Patch(0x0A964F5, "0F84B3000000", "909090909090", MemProtection.PAGE_EXECUTE_READ),
                new Patch(0x0A96505, "0F84A3000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
            },
            configdomain = new[] { new Patch(0x2AA4948, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
            protocol = new[]
            {
                new Patch(0x16A5260, "68", "61", MemProtection.PAGE_READONLY) // This probably works by making the https://{0} string invalid and it then defaulting to http://
            },
            dynres_noforceoffline = new[] { new Patch(0x2AA4E48, "01", "00", MemProtection.PAGE_READWRITE) }
        };

        private static HitmanVersion sniper_v1_0_1_h1_dx12 = new HitmanVersion()
        {
            certpin = new[] { new Patch(0x0488520, "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
            authheader = new[]
            {
                new Patch(0x0A95685, "0F84B3000000", "909090909090", MemProtection.PAGE_EXECUTE_READ),
                new Patch(0x0A95695, "0F84A3000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
            },
            configdomain = new[] { new Patch(0x2AB5F08, "", "", MemProtection.PAGE_READWRITE, "configdomain") },
            protocol = new[]
            {
                new Patch(0x16B6270, "68", "61", MemProtection.PAGE_READONLY) // This probably works by making the https://{0} string invalid and it then defaulting to http://
            },
            dynres_noforceoffline = new[] { new Patch(0x2AB6408, "01", "00", MemProtection.PAGE_READWRITE) }
        };
    }
}