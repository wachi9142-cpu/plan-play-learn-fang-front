"use client";

import Link from "next/link";
import { Download, Eye, Printer } from "lucide-react";
import type { Worksheet } from "@/types";

/** ปุ่ม ดูตัวอย่าง / ดาวน์โหลด / พิมพ์ (client เพราะต้องเรียก window.print) */
export function WorksheetActions({ worksheet }: { worksheet: Worksheet }) {
  const printUrl = `/worksheets/${worksheet.id}/print`;
  const file = worksheet.file;

  return (
    <div className="no-print flex flex-wrap gap-2">
      <a href="#preview" className="tap inline-flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:bg-purple-50">
        <Eye size={18} /> ดูตัวอย่าง
      </a>
      {file ? (
        <a href={file.url} download className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
          <Download size={18} /> ดาวน์โหลดใบงาน
        </a>
      ) : (
        <Link href={`${printUrl}?download=1`} target="_blank" className="tap inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-[15px] font-medium text-white shadow-soft hover:bg-purple-700">
          <Download size={18} /> ดาวน์โหลด (บันทึกเป็น PDF)
        </Link>
      )}
      <Link href={printUrl} target="_blank" className="tap inline-flex items-center gap-2 rounded-full border-2 border-purple-200 bg-white px-5 py-2.5 text-[15px] font-medium text-purple-700 hover:bg-purple-50">
        <Printer size={18} /> พิมพ์ใบงาน
      </Link>
    </div>
  );
}
