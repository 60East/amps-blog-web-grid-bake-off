from AMPS import Client
import sys


def ts_filter(data, incoming):
    print(data)


def main(*args):
    # set up the client
    client = Client('the-publisher')
    client.connect('tcp://localhost:9007/amps/json')
    client.set_transport_filter(ts_filter)
    client.logon()

    for m in client.sow_and_subscribe('orders', '/id IS NULL'):
        print(m.get_data())


if __name__ == '__main__':
    # detect command line arguments
    if len(sys.argv) > 1:
        main(*sys.argv[1:])
    else:
        main()

