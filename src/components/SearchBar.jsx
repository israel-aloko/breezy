import React, { useEffect, useState } from 'react'
import { IoSearch } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';

export default function SearchBar() {
    const [input, setInput] = useState("");
    const location = useLocation();
    const [placeholder, setPlaceholder] = useState();

    const fetchData = (value) => {
        if (!value.trim()) {
            setResults([]);
            return;
        }
        fetch(`${import.meta.env.VITE_API_URL}/search?query=${value}`)
            .then((response) => response.json())
            .then(json => {
                setResults(json);
            });
    }

    const handleChange = (value) => {
        setInput(value)
        fetchData(value)
    }

    useEffect(() => {
        const updatePlaceholder = () => {
            if (window.innerWidth >= 768) {
                setPlaceholder("What are you looking for?");
            } else {
                setPlaceholder("Search products...");
            }
        };

        updatePlaceholder(); //run on mount
        window.addEventListener("resize", updatePlaceholder);

        return () => window.removeEventListener("resize", updatePlaceholder);
    }, []);


    return (
        <div className="container">
            <div className="relative w-full">
                <IoSearch className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 text-xl md:text-xl text-gray-500" />

                <input
                    type="text"
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full px-2 md:px-10 py-2 md:py-2 md:text-lg rounded-full border border-green-800 hover:border-green-800 focus:outline-offset-1 focus:outline-green-700"
                />

            </div>
        </div>
    )
}
