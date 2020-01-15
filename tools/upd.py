from AMPS import Client
import random
import time
import json
import sys


def main(*args):
    publish_rate = None  # publish as fast as possible by default
    try:
        publish_rate = int(args[0])
        start = int(args[1])
        end = int(args[2])
    except Exception:
        pass

    # set up the client
    client = Client('the-publisher')
    client.connect('tcp://localhost:9007/amps/json')
    client.logon()

    while True:
        # generate and publish data
        current_id = random.randint(start, end)
        price_usd = random.randint(20000, 30000)
        quantity = random.randint(1, 100)
        total = price_usd * quantity

        client.publish(
            'orders',
            json.dumps({
                'order_id': current_id,
                'name': '>>> TESLA UPDATE <<<',
                'price_usd': price_usd,
                'quantity': quantity,
                'total': total
            })
        )

        if publish_rate is not None and publish_rate > 0:
            time.sleep(1.0 / publish_rate)


if __name__ == '__main__':
    # detect command line arguments
    if len(sys.argv) > 1:
        main(*sys.argv[1:])
    else:
        main()
