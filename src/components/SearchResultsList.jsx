import React from 'react'
import { SearchResult } from './SearchResult'

export default function SearchResultsList({ results }) {
  return (
    <div className="w-[100%] max-h-[300px] bg-green-900 text-white flex flex-col shadow overflow-y-scroll absolute top-16 md:top-20">
        {
            results.map((result, id) => {
                return <SearchResult result={result} key={id}/>
            })
        }
    </div>
  )
}