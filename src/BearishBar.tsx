

export const BearishBar = (props: { priceChangeM5?: number }) => {
    let bearishPercent: number = 50;

    if (props.priceChangeM5) {
        if (props.priceChangeM5 < 0) {
            if (props.priceChangeM5 < -10) {
                bearishPercent = 5;

            } else if (props.priceChangeM5 < -5) {
                bearishPercent = 30;

            } else if (props.priceChangeM5 < -2) {
                bearishPercent = 40;

            } else {
                bearishPercent = 45;
            }

        } else if (props.priceChangeM5 > 0) {
            if (props.priceChangeM5 > 10) {
                bearishPercent = 95;

            } else if (props.priceChangeM5 > 5) {
                bearishPercent = 70;

            } else if (props.priceChangeM5 > 2) {
                bearishPercent = 60;

            } else {
                bearishPercent = 55;
            }

        }
    }

    return (
        <div className='d-flex' style={{ height: "10px" }} title={`Bearish indicator: ${bearishPercent}%`}>
            <div style={{ backgroundColor: '#d1111c', width: `${100-bearishPercent}%` }}></div>
            <div style={{ backgroundColor: '#1fac9b', width: `${bearishPercent}%` }}></div>
        </div>
    );
}

