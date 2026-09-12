import React from 'react'
import { Link } from 'react-router-dom'

export default function ProjectCard({ _id, name, description, deadline, members, owner}) {

    const memberCount = members?.length || 0

    const formattedDeadline = deadline
        ? new Date(deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null


  return (
    <Link
      to={`/projects/${_id}`}
      className="block rounded-lg border border-stone-200 p-4 hover:border-green-700/40 hover:shadow-sm duration-200"
    >
      <h2 className="text-lg font-medium text-stone-900">{name}</h2>
 
      {description && (
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>
      )}
 
      <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        {formattedDeadline && <span>Due {formattedDeadline}</span>}
      </div>
    </Link>
  )
}
