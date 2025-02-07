'user client'
import { EventBus } from '@/game/EventBus';
import { useState } from 'react';

interface Bottle {
    title: string,
    body: string,
    author: string,
    time: Date,
    id: number
}

interface BottleListProps {
    bottles: Bottle[];
    title: string;
    onSelectBottle: (id: number) => void; 
  }

const BottleList = ({bottles, title, onSelectBottle } : BottleListProps) => {

    const handleClick = (id: number) => {
        onSelectBottle(id);
        EventBus.emit('open-bottle-detail-scene');
    }

    // pages
    const [currentPage, setCurrentPage] = useState(1);

    // number of items of each page && total pages
    const itemsPerPage = 2;
    const totalPages = Math.ceil(bottles.length / itemsPerPage);

    // displayed pages
    const startIndex = (currentPage - 1) * itemsPerPage; 
    const endIndex = startIndex + itemsPerPage;
    const displayedBottles = bottles.slice(startIndex, endIndex);

    // turn pages
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
        };
    
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return ( 
        <div className="bottle-list"
        style={{
            zIndex: 20,
        }}>
        {title === 'all' ? (<h2>{'All Bottles'}</h2>) : (<h2>{`Bottles from ${title}`}</h2>)}
        
        {displayedBottles.map((bottle) => (
            <div className="bottle-preview" key={bottle.id}>
                <div                    
                    onClick={() => handleClick(bottle.id)}
                >
                    <h2>{bottle.title}</h2>
                    <p>Written by {bottle.author}</p>
                </div>
            </div>
        ))}
        <div className="pagination-controls">
        {currentPage > 1 && <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="mr-2 px-2 py-1 bg-gray-300 disabled:bg-gray-100"
        >
          上一页
        </button>}
        
        {currentPage < totalPages && <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-gray-300 disabled:bg-gray-100"
        >
          下一页
        </button>}
      </div>
    </div>
    );
}
 
export default BottleList;