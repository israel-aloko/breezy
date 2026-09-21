import React from 'react'
import { Link } from 'react-router-dom'

export default function Homepage() {
  return (
    <div className="bg-[#F7F5F1] text-[#101418]">

      {/* Hero */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 px-6 md:px-12 pt-16 md:pt-24 pb-20 md:pb-28 items-center">
        <div className="max-w-md">
          <p className="text-[#3A5A68] text-sm mb-5">
            For remote teams working across time zones
          </p>
          <h1 className="font-serif text-[42px] md:text-[52px] leading-[1.08] font-medium tracking-tight mb-6">
            Work that keeps moving when you're not.
          </h1>
          <p className="text-[17px] text-[#4a4f54] max-w-[40ch] mb-9">
            Projects, tasks, and updates that don't need everyone online at
            once. {`{App name}`} gives your team one place to plan, track,
            and catch up — on their own time.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/signup"
              className="bg-[#3A5A68] text-[#F7F5F1] px-6 py-3 rounded-[3px] text-[15px] font-medium"
            >
              Create your first project
            </Link>
            <a
              href="#how-it-works"
              className="text-[#101418] text-[15px] border-b border-[#101418] py-3"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Board mockup */}
        <div className="bg-white border border-[#E8E3DA] rounded-md p-5 shadow-[0_24px_60px_-20px_rgba(16,20,24,0.18)]">
          <div className="flex justify-between items-center mb-4 pb-3.5 border-b border-[#E8E3DA]">
            <span className="font-serif text-sm">Website Relaunch</span>
            <span className="text-[13px] text-[#8B8377]">4 members · updated 2h ago</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-[#8B8377] mb-2.5 pl-0.5">To do</div>
              <div className="bg-[#F7F5F1] border border-[#E8E3DA] rounded p-2.5 mb-2 text-[12.5px]">
                <div className="mb-1.5">Draft onboarding copy</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] text-[#8B8377]">Due Fri</span>
                  <span className="w-4 h-4 rounded-full bg-[#3A5A68] inline-block" />
                </div>
              </div>
              <div className="bg-[#F7F5F1] border border-dashed border-[#E8E3DA] rounded p-2.5 text-[12.5px] opacity-45">
                Audit old redirects
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8B8377] mb-2.5 pl-0.5">In progress</div>
              <div className="bg-[#F7F5F1] border border-[#E8E3DA] rounded p-2.5 text-[12.5px]">
                <div className="mb-1.5">Build pricing page</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] text-[#8B8377]">Due Wed</span>
                  <span className="w-4 h-4 rounded-full bg-[#3A5A68] inline-block" />
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8B8377] mb-2.5 pl-0.5">Done</div>
              <div className="bg-[#F7F5F1] border border-[#E8E3DA] rounded p-2.5 text-[12.5px]">
                <div className="mb-1.5">Set up staging env</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] text-[#8B8377]">Mon</span>
                  <span className="w-4 h-4 rounded-full bg-[#3A5A68] inline-block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="border-t border-[#E8E3DA] max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-lg mb-12 md:mb-14">
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-3">
            Built for teams who aren't in the same room, or the same hour.
          </h2>
          <p className="text-[15.5px] text-[#8B8377]">
            No stand-ups required. Everything your team needs to stay
            aligned lives in the project, not in a meeting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E8E3DA] border border-[#E8E3DA]">
          <div className="bg-[#F7F5F1] p-7">
            <div className="font-serif text-sm text-[#3A5A68] mb-4">Boards</div>
            <h3 className="text-[16.5px] font-semibold mb-2">Every project, one board</h3>
            <p className="text-sm text-[#8B8377] leading-relaxed">
              Create a project, invite your team, and track tasks from open
              to done without switching tools.
            </p>
          </div>
          <div className="bg-[#F7F5F1] p-7">
            <div className="font-serif text-sm text-[#3A5A68] mb-4">Activity</div>
            <h3 className="text-[16.5px] font-semibold mb-2">Catch up in a glance</h3>
            <p className="text-sm text-[#8B8377] leading-relaxed">
              A running feed of what changed on a project, so coming back
              after a day off takes a minute, not a meeting.
            </p>
          </div>
          <div className="bg-[#F7F5F1] p-7">
            <div className="font-serif text-sm text-[#3A5A68] mb-4">Access</div>
            <h3 className="text-[16.5px] font-semibold mb-2">Invite who needs to be there</h3>
            <p className="text-sm text-[#8B8377] leading-relaxed">
              Project-level roles mean the right people see the right work —
              no company-wide setup required.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[#E8E3DA] max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-20 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
        <h2 className="font-serif text-2xl md:text-3xl font-medium max-w-[20ch]">
          Start a project in under a minute.
        </h2>
        <Link
          to="/signup"
          className="bg-[#3A5A68] text-[#F7F5F1] px-6 py-3 rounded-[3px] text-[15px] font-medium w-fit"
        >
          Create your first project
        </Link>
      </section>
    </div>
  )
}