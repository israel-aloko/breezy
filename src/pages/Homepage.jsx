
import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckSquare, FiClock, FiFolder, FiUsers } from 'react-icons/fi'

const PROJECTS = [
  { name: 'Website Relaunch', done: 6, total: 8 },
  { name: 'Mobile App v2', done: 3, total: 10 },
  { name: 'Q4 Campaign', done: 9, total: 12 },
]

const FEATURES = [
  {
    icon: FiFolder,
    title: 'Manage projects',
    body: 'Create projects, add your team, and keep all your work in one place.',
  },
  {
    icon: FiCheckSquare,
    title: 'Track tasks',
    body: 'Create tasks, assign them to team members, and keep track of their progress.',
  },
  {
    icon: FiClock,
    title: 'Meet deadlines',
    body: 'Set deadlines and priorities so everyone knows what needs to be done.',
  },
  {
    icon: FiUsers,
    title: 'Work together',
    body: 'See what your team is working on and keep everyone up to date.',
  },
]

export default function Homepage() {
  return (
    <div className="bg-white text-gray-900">

      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-2xl">

          <p className="text-green-900 font-bold mb-4">
            For remote teams working across time zones
          </p>

          <h1 className="text-4xl md:text-4xl font-semibold leading-tight mb-6">
            Keep your team and projects organized.
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            Projects, tasks, and updates that don't need everyone online at
            once. Breezy gives your team one place to plan, track, and catch up, on their own time.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link
              to="/signup"
              className="flex items-center px-2 py-1 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium"
            >
              Create your first project
            </Link>

            <a
              href="#features"
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              See how it works
            </a>
          </div>

        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">

          <div className="max-w-xl mb-8">
            <h2 className="text-3xl font-medium mb-3">
              See your projects at a glance.
            </h2>

            <p className="text-gray-600">
              Quickly see how your projects are progressing
              and what still needs to be completed.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-3xl">

            <h3 className="font-semibold mb-5">
              Project progress
            </h3>

            <div className="space-y-6">
              {PROJECTS.map((project) => (
                <div key={project.name}>

                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {project.name}
                    </span>

                    <span className="text-sm text-gray-500">
                      {project.done}/{project.total}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{
                        width: `${(project.done / project.total) * 100}%`,
                      }}
                    />
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      <section
        id="features"
        className="max-w-6xl mx-auto px-6 py-20"
      >

        <div className="max-w-xl mb-10">
          <h2 className="text-2xl md:text-3xl font-medium mb-3">
            Built for teams who aren't in the same room, or the same hour.
          </h2>

          <p className="text-gray-600">
            Keep your team's work organized without making
            project management complicated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="border border-gray-200 rounded-lg p-5"
            >
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-md flex items-center justify-center mb-4">
                <feature.icon size={20} />
              </div>

              <h3 className="font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}

        </div>

      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">

        <div className="bg-green-800 rounded-lg px-8 py-12 text-white">

          <h2 className="text-2xl font-bold mb-4">
            Ready to get organized?
          </h2>

          <p className="text-green-50 mb-6 max-w-lg">
            Create a project and start managing your team's
            work in one place.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-green-800 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Create a project
            <FiArrowRight />
          </Link>

        </div>

      </section>

    </div>
  )
}

