import { useGet } from "@/hooks/useGet";

interface Bottle {
    title: string;
    body: string;
    author: string;
    time: Date;
    id: number;
}

interface BottleDetailsProps {
    bottleId: number;
    bottles: Bottle[];
    onChangeBottleId: (newId: number) => void;
  }

  const BottleDetails = ({ bottleId, bottles, onChangeBottleId }: BottleDetailsProps) => {
    const index = bottles.findIndex(b => b.id === bottleId);
    if (index < 0) {
        return (
          <div style={{ position: 'absolute', top: 300, left: 100 }}>
            <p>找不到该瓶子ID: {bottleId}</p>
          </div>
        );
    }

    // const currentBottle = bottles[index];

    const canGoPrev = index > 0;
    const canGoNext = index < bottles.length - 1;

    const { data, error, isValidating } = useGet<Bottle>(
      `/api/driftbottles/${bottleId}`
    );

    return (
        <div className="bottle-details"
            style={{
                position: 'absolute',
                top: 300,
                left: 100,
                color: 'black',
                fontSize: '24px',
                zIndex: 10,
            }}>
            <div className="bottle-button-next">
                { canGoPrev &&  (
                <button onClick={() => onChangeBottleId(bottles[index-1].id)}>上一条</button>
                )}
                { canGoNext && (
                <button onClick={() => onChangeBottleId(bottles[index+1].id)}>下一条</button>
                )}
            </div>
            {isValidating && <div>Loading...</div>}
            {error && <div>{error}</div>}
            {data && (
                <article>
                    <h2>{data.title}</h2>
                    <p>Written by {data.author}</p>
                    <div>{data.body}</div>
                </article>
            )}
        </div>
    );
}

export default BottleDetails;