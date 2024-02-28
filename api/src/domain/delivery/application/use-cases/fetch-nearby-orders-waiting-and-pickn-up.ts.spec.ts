import { FetchNearbyOrdersWaitingAndPicknUpUseCase } from './fetch-nearby-orders-waiting-and-pickn-up';

import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository';

import { makeOrder } from 'test/factories/make-orders';

import { Role, Status } from '@/domain/delivery/enterprise/entities/order';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

let inMemoryOrdersRepository: InMemoryOrdersRepository;
let sut: FetchNearbyOrdersWaitingAndPicknUpUseCase;

describe("Fetch Nearby Orders Waiting and Pick'n Up", () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository();
    sut = new FetchNearbyOrdersWaitingAndPicknUpUseCase(
      inMemoryOrdersRepository,
    );
  });

  it("should be able to fetch recent orders with waiting and pick'n up status", async () => {
    const newOrder1 = makeOrder({
      city: 'Somewhere City',
    });
    const newOrder2 = makeOrder({
      city: 'Somewhere City',
    });
    const newOrder3 = makeOrder({
      city: 'Somewhere City',
    });

    await inMemoryOrdersRepository.create(newOrder1);
    await inMemoryOrdersRepository.create(newOrder2);
    await inMemoryOrdersRepository.create(newOrder3);

    newOrder1.status = Status.PICKN_UP;
    newOrder2.status = Status.DONE;
    newOrder3.status = Status.WAITING;

    newOrder1.deliverymanId = new UniqueEntityID();
    newOrder2.deliverymanId = new UniqueEntityID();

    await inMemoryOrdersRepository.save(newOrder1);
    await inMemoryOrdersRepository.save(newOrder2);
    await inMemoryOrdersRepository.save(newOrder3);

    const result = await sut.execute({
      deliverymanRole: Role.DELIVERYMAN,
      city: 'Somewhere City',
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value?.orders).toHaveLength(2);
    }
  });

  it('should not be able to fetch recent orders other than waiting or picknup status', async () => {
    const newOrder1 = makeOrder({
      city: 'Somewhere City',
    });
    const newOrder2 = makeOrder({
      city: 'Somewhere City',
    });

    await inMemoryOrdersRepository.create(newOrder1);
    await inMemoryOrdersRepository.create(newOrder2);

    newOrder1.deliverymanId = new UniqueEntityID('deliveryman-01');
    newOrder2.deliverymanId = new UniqueEntityID('deliveryman-01');

    newOrder1.status = Status.DONE;
    newOrder2.status = Status.DONE;

    await inMemoryOrdersRepository.save(newOrder1);
    await inMemoryOrdersRepository.save(newOrder2);

    const result = await sut.execute({
      deliverymanRole: Role.DELIVERYMAN,
      city: 'Somewhere City',
      page: 1,
    });

    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(0);
    }
  });
});
