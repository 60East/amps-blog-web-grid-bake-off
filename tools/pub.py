from AMPS import Client
import random
import time
import json
import sys


def get_valid_input():
    result = None

    while result is None:
        try:
            result = int(raw_input('How many messages to publish (0 to stop, -1 to sow_delete): '))
            if result >= 0:
                return result
        except:
            result = None


def main(*args):
    current_id = 1
    publish_rate = None  # publish as fast as possible by default
    try:
        current_id = int(args[0])
        publish_rate = int(args[1])
    except:
        pass

    teslas = ['S', '3', 'X', 'Roadster']

    # set up the client
    client = Client('the-publisher')
    client.connect('tcp://localhost:9007/amps/json')
    client.logon()

    how_many_to_publish = 0

    while True:
        print('Current id: %d' % current_id)
        how_many_to_publish = get_valid_input()

        # done publishing
        if how_many_to_publish == 0:
            return client.close()
        elif how_many_to_publish < 0:
            client.sow_delete('orders', '1=1')
            current_id = 1
            continue

        # publish some
        for _ in xrange(how_many_to_publish):
            # generate fake data
            price_usd = random.randint(20000, 30000)
            quantity = random.randint(1, 100)
            total = price_usd * quantity

            client.publish(
                'orders',
                json.dumps({
                    'order_id': current_id,
                    'name': 'Tesla Model ' + teslas[random.randint(0, len(teslas) - 1)],
                    'price_usd': price_usd,
                    'quantity': quantity,
                    'total': total
                })
            )

            current_id += 1

            if publish_rate is not None and publish_rate > 0:
                time.sleep(1.0 / publish_rate)


if __name__ == '__main__':
    # detect command line arguments
    if len(sys.argv) > 1:
        main(*sys.argv[1:])
    else:
        main()

