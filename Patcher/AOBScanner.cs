// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace HitmanPatcher
{
	public class AOBScanner
	{
		public static bool TryGetHitmanVersionByScanning(Process process, IntPtr hProcess, out HitmanVersion result)
		{
			IntPtr baseAddress = process.MainModule.BaseAddress;
			byte[] exeData = new byte[process.MainModule.ModuleMemorySize];
			UIntPtr bytesread;
			Pinvoke.ReadProcessMemory(hProcess, baseAddress, exeData, (UIntPtr)exeData.Length, out bytesread); // fuck it, just read the whole thing
			Task<int[]> getCertpinAddr = Task.Factory.StartNew(() => findPattern(exeData, 0xd,
				"0f856ffdffffc747302f000000c7471804000000"));
			Task<int[]> getAuthhead1Addr = Task.Factory.StartNew(() => findPattern(exeData, 0xd,
				"0f85b50000004883f90675e8"));
			Task<int[]> getAuthhead2Addr = Task.Factory.StartNew(() => findPattern(exeData, 0x3,
				"0f84b800000084db0f85b0000000"));
			Task<int[]> getDomainAddr = Task.Factory.StartNew(() => findPattern(exeData, 0xe,
				"488905 ? ? ? 03488d0d ? ? ? 034883c4205b48ff25 ? ? ? 01"))
				.ContinueWith(task => task.Result.Select(addr => addr + 14 + BitConverter.ToInt32(exeData, addr + 10)).ToArray());
			Task<int[]> getProtocolAddr = Task.Factory.StartNew(() => findPattern(exeData, 0x0,
				"68747470733a2f2f7b307d00"));
			Task<int[]> getForceOfflineAddr = Task.Factory.StartNew(() => findPattern(exeData, 0x1,
				"83f17269c193010001488d0d ? ? ? 0383f06569d093010001e8 ? ? 0400488d05 ? ? ? 01c705 ? ? ? 0301000000"))
				.ContinueWith(task => task.Result.Select(addr => addr + 47 + BitConverter.ToInt32(exeData, addr + 39)).ToArray());

			Task<int[]>[] tasks = { getCertpinAddr, getAuthhead1Addr, getAuthhead2Addr, getDomainAddr, getProtocolAddr, getForceOfflineAddr };
			Task.WaitAll(tasks);

			// error out if any pattern does not have exactly 1 search result
			if (tasks.Any(task => task.Result.Count() != 1))
			{
				result = null;
				return false;
			}

			result = new HitmanVersion()
			{
				certpin = new[] { new Patch(getCertpinAddr.Result.First(), "0F85", "90E9", MemProtection.PAGE_EXECUTE_READ) },
				authheader = new[]
				{
					new Patch(getAuthhead1Addr.Result.First(), "0F85B5000000", "909090909090", MemProtection.PAGE_EXECUTE_READ),
					new Patch(getAuthhead2Addr.Result.First(), "0F84B8000000", "909090909090", MemProtection.PAGE_EXECUTE_READ)
				},
				configdomain = new[] { new Patch(getDomainAddr.Result.First(), "", "", MemProtection.PAGE_READWRITE, "configdomain") },
				protocol = new[]
				{
					new Patch(getProtocolAddr.Result.First(), "68", "61", MemProtection.PAGE_READONLY)
				},
				dynres_noforceoffline = new[] { new Patch(getForceOfflineAddr.Result.First(), "01", "00", MemProtection.PAGE_EXECUTE_READWRITE) }
			};

			return true;
		}

		private static int[] findPattern(byte[] data, byte alignment, string pattern)
		{
			List<int> results = new List<int>();

			// convert string pattern to byte array
			List<byte> bytepatternlist = new List<byte>();
			List<bool> wildcardslist = new List<bool>();
			pattern = pattern.Replace(" ", ""); // remove spaces
			for (int i = 0; i < pattern.Length; i += 2)
			{
				string twochars = pattern.Substring(i, 2);
				if (twochars.StartsWith("?"))
				{
					wildcardslist.Add(true);
					bytepatternlist.Add(0x00); // dummy value
					i -= 1; // only step forward by 1 because I use one '?' for a byte
				}
				else
				{
					wildcardslist.Add(false);
					bytepatternlist.Add(Convert.ToByte(twochars, 16));
				}
			}
			byte[] bytepattern = bytepatternlist.ToArray();
			bool[] wildcards = wildcardslist.ToArray();

			// search data for byte array
			for (int i = alignment; i < data.Length; i += 16)
			{
				int j = 0;
				while (wildcards[j] || data[i + j] == bytepattern[j])
				{
					j += 1;
					if (j == bytepattern.Length)
					{
						results.Add(i);
						break;
					}
				}
			}

			return results.ToArray();
		}
	}
}
