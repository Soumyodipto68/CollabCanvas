import { ArrowRight, Home, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "../../components/common/BrandMark.tsx";

export function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#080d0e] bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[48px_48px] text-[#f1f3f4]">
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-[5vw] sm:py-[26px]">
        <Link
          className="inline-flex items-center gap-2.5 text-lg font-semibold text-[#edf2ef] no-underline"
          to="/"
          aria-label="Canvas home"
        >
          <BrandMark />
          <span>Collab Canvas</span>
        </Link>
        <span className="rounded border border-[#34423f] px-2.5 py-[7px] text-[10px] font-bold tracking-[0.12em] text-[#879793]">
          PAGE NOT FOUND
        </span>
      </header>

      <section
        className="relative z-10 mx-auto flex w-[calc(100%-2rem)] max-w-[620px] flex-1 flex-col items-center justify-center py-[30px] text-center sm:w-[calc(100%-2.5rem)] sm:py-[38px]"
        aria-labelledby="not-found-title"
      >
        <div
          className="relative mb-[30px] h-[190px] w-full max-w-[390px] overflow-hidden rounded-[7px] border border-[#354642] bg-[#0b1414] bg-[linear-gradient(rgba(149,181,169,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(149,181,169,0.08)_1px,transparent_1px)] bg-size-[24px_24px] shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:mb-[38px] sm:h-[220px]"
          aria-hidden="true"
        >
          <span className="absolute left-[15px] top-[13px] z-10 text-[9px] font-bold tracking-[0.08em] text-[#879793]">
            untitled-board
          </span>
          <span className="absolute left-[calc(50%-44px)] top-[59px] grid h-[82px] w-[88px] rotate-[-5deg] place-items-center rounded-[3px] border border-white/10 bg-[#f47b58] text-[31px] font-bold text-[#1d2422] shadow-[0_12px_28px_rgba(0,0,0,0.3)] sm:left-[calc(50%-52px)] sm:h-24 sm:w-[104px]">
            404
          </span>
          <span className="absolute left-[calc(50%-105px)] top-[89px] flex h-[82px] w-[88px] rotate-[7deg] flex-col gap-2 rounded-[3px] border border-white/10 bg-[#85c7a7] px-[13px] py-[18px] shadow-[0_12px_28px_rgba(0,0,0,0.3)] sm:left-[calc(50%-122px)] sm:h-24 sm:w-[104px]">
            <span className="h-1 rounded bg-[#15362b]/35" />
            <span className="h-1 w-[70%] rounded bg-[#15362b]/35" />
            <span className="h-1 w-[85%] rounded bg-[#15362b]/35" />
          </span>
          <span className="absolute left-[calc(50%+16px)] top-[88px] h-[72px] w-[88px] rotate-[8deg] rounded-[3px] border border-white/10 bg-[#e8c86e] shadow-[0_12px_28px_rgba(0,0,0,0.3)] sm:left-[calc(50%+20px)] sm:h-[84px] sm:w-[104px]" />
          <span className="absolute left-[calc(50%+54px)] top-[145px] flex rotate-[-8deg] items-center gap-1.5 text-[10px] font-semibold text-[#a8d8c1] sm:left-[calc(50%+78px)] sm:top-[156px]">
            <span className="h-[10px] w-[10px] rounded-full border-2 border-[#a8d8c1]" />
            pointer
          </span>
          <span className="absolute bottom-3 right-3.5 z-10 text-[9px] font-medium tracking-[0.08em] text-[#879793]">
            x: 00 / y: 00
          </span>
        </div>

        <p className="mb-3 text-[10px] font-bold tracking-[0.16em] text-[#fb8057]">
          A LITTLE OFF THE CANVAS
        </p>
        <h1
          className="max-w-[560px] text-[clamp(2rem,5vw,2.875rem)] font-medium leading-[1.12] text-[#f1f3f4]"
          id="not-found-title"
        >
          This page has wandered off.
        </h1>
        <p className="mt-4 max-w-[420px] text-sm leading-[1.7] text-[#9aa9a4]">
          We couldn’t find the board or page you were looking for. It may have
          been moved, renamed, or never existed.
        </p>
        <div className="mt-[26px] flex flex-wrap justify-center gap-2.5">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-[9px] rounded-[5px] bg-[#fb8057] px-[15px] text-[13px] font-semibold text-[#171d1b] no-underline transition duration-200 hover:-translate-y-px hover:bg-[#ff9976]"
            to="/"
          >
            <Home size={17} aria-hidden="true" />
            Back to home
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-[9px] rounded-[5px] border border-[#3b514e] bg-[#10191a] px-[15px] text-[13px] font-semibold text-[#e7efec] no-underline transition duration-200 hover:-translate-y-px hover:border-[#6e9183] hover:bg-[#172120]"
            to="/dashboard"
          >
            <LayoutDashboard size={17} aria-hidden="true" />
            Open dashboard
          </Link>
        </div>
        <p className="mt-7 text-[9px] font-bold tracking-[0.12em] text-[#879793]">
          ERROR 404 <span className="px-[5px] text-[#fb8057]">·</span> LOST IN
          THE WORKSPACE
        </p>
      </section>
    </main>
  );
}
