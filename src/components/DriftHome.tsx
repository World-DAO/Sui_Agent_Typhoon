import { useGet } from '@/hooks/useGet';
import BottleList from '@/components/BottleList';
import { useState, useMemo, useEffect, useRef } from 'react';

interface Bottle {
    title: string;
    body: string;
    author: string;
    time: Date;
    id: number;
}

interface DriftHomeProps {
    htmlPosition: { top: number; left: number };
    htmlContent: string;
    onSelectBottle: (id: number) => void; 
    onSetBottles: (bottles: Bottle[]) => void;
  }

  const DriftHome = ({
    htmlPosition,
    htmlContent,
    onSelectBottle,
    onSetBottles
  }: DriftHomeProps) => {
    const { data, error, isValidating } = useGet<Bottle[]>('/api/driftbottles');
    const [selectedAuthor, setSelectedAuthor] = useState<'all' | string>('all');

    const authorList = useMemo(() => {
        if (!data) return [];
        return Array.from(new Set(data.map(b => b.author)));
      }, [data]);

    const filteredBottles = data
        ? data.filter((bottle) => {
            return selectedAuthor === 'all' || bottle.author === selectedAuthor;
            })
        : [];
        
    const prevFilteredRef = useRef<Bottle[] | null>(null);
    
    useEffect(() => {
        if (!isArraysEqual(filteredBottles, prevFilteredRef.current!)) {
            onSetBottles(filteredBottles);
            prevFilteredRef.current = filteredBottles;
          }
    }, [filteredBottles, onSetBottles]);

    function isArraysEqual(arr1: Bottle[], arr2?: Bottle[]): boolean {
        if (!arr2 || arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i].id !== arr2[i].id) return false;
        }
        return true;
    }

    return (
        <div className="drift-home"
            style={{
                position: 'absolute',
                top: htmlPosition.top,
                left: htmlPosition.left,
                color: 'black',
                fontSize: '24px',
                zIndex: 20,
            }}>
            {error && <div>{error}</div>}
            {isValidating && <div>Loading...</div>}
            <div className='author-filter'>
            <label>筛选: </label>
            <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                style={{ fontSize: '16px' }}
            >
                <option value="all">全部</option>
                {authorList.map((author) => (
                    <option key={author} value={author}>
                    {author}
                    </option>
                ))}
            </select>
        </div>
            {data && (
                <BottleList
                    bottles={filteredBottles}
                    title={selectedAuthor}
                    onSelectBottle={onSelectBottle}
                />
            )}
        </div>
    );
}

export default DriftHome;
