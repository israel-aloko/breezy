import React from 'react'
import { Link } from 'react-router-dom'

export const SearchResult = ({ result }) => {
    return (
        <Link to={`/shop/${result.id}`}>
            <div className="flex justify-between items-center p-2.5 hover:bg-green-700 duration-300 ease-in-out">
                <span>
                    {result.name}
                    {result.localName && (
                        <span className="text-green-300 text-sm"> ({result.localName})</span>
                    )}
                </span>
                <span className="text-xs text-green-300">{result.category}</span>
            </div>
        </Link>
    )
}