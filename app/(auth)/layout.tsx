import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      {/* Bagian kiri */}
      <section className="hidden w-1/2 flex-col justify-between bg-brand p-10 text-white lg:flex xl:w-2/5">
        <div className="flex flex-col items-center justify-center flex-1 space-y-12">
          <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
            <Image
              src="/assets/icons/logo-full.svg"
              alt="logo"
              width={224}
              height={82}
              className="h-auto"
            />

            <div className="space-y-5">
              <h1 className="h1">Semua File, Satu Tempat Aman</h1>
              <p className="body-1">
                SatuCloud menghadirkan solusi penyimpanan modern untuk semua dokumen pentingmu.
              </p>
            </div>
            <Image
              src="/assets/images/files.png"
              alt="Files"
              width={342}
              height={342}
              className="transition-all hover:rotate-2 hover:scale-105"
            />
          </div>
        </div>

        {/* Kalimat di bawah */}
        <p className="text-center text-sm opacity-80 mt-8">
          © 2025 — <span className="font-semibold">Perwakilan BKKBN Kalimantan Tengah</span>
        </p>
      </section>

      {/* Bagian kanan */}
      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/icons/logo-full-brand.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto w-[200px] lg:w-[250px]"
          />
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;
