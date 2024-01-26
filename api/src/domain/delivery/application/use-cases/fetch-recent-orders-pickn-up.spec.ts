import { FetchRecentOrdersPicknUpUseCase } from './fetch-recent-orders-pickn-up';

import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository';

import { makeOrder } from 'test/factories/makeOrders';

import { Status } from '@/domain/delivery/enterprise/entities/order';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

let inMemoryOrdersRepository: InMemoryOrdersRepository;
let sut: FetchRecentOrdersPicknUpUseCase;

describe("Fetch Recent Orders Pick'n Up", () => {
  beforeEach(() => {
    inMemoryOrdersRepository = new InMemoryOrdersRepository();
    sut = new FetchRecentOrdersPicknUpUseCase(inMemoryOrdersRepository);
  });

  it("should be able to fetch recent orders with pick'n up status", async () => {
    const newOrder1 = makeOrder();
    const newOrder2 = makeOrder();
    const newOrder3 = makeOrder();

    await inMemoryOrdersRepository.create(newOrder1);
    await inMemoryOrdersRepository.create(newOrder2);
    await inMemoryOrdersRepository.create(newOrder3);

    const newDeliverymanId = new UniqueEntityID('deliveryman-01');
    const deliverymanId = newDeliverymanId.toString();

    newOrder1.status = Status.PICKN_UP;
    newOrder2.status = Status.PICKN_UP;
    newOrder3.status = Status.PICKN_UP;

    newOrder1.deliverymanId = newDeliverymanId;
    newOrder2.deliverymanId = newDeliverymanId;
    newOrder3.deliverymanId = newDeliverymanId;

    await inMemoryOrdersRepository.save(newOrder1);
    await inMemoryOrdersRepository.save(newOrder2);
    await inMemoryOrdersRepository.save(newOrder3);

    const result = await sut.execute({
      deliverymanId,
      page: 1,
    });

    expect(result.value?.orders).toHaveLength(3);
  });

  it("should be able to fetch paginated orders with pick'n up status", async () => {
    for (let i = 0; i < 22; i++) {
      await inMemoryOrdersRepository.create(
        makeOrder({
          deliverymanId: new UniqueEntityID('deliveryman-01'),
          status: Status.PICKN_UP,
        }),
      );
    }

    const result = await sut.execute({
      deliverymanId: 'deliveryman-01',
      page: 2,
    });

    expect(result.value?.orders).toHaveLength(2);
  });

  it("should be able to fetch only orders with pick'n up status", async () => {
    const newOrder1 = makeOrder();
    const newOrder2 = makeOrder();
    const newOrder3 = makeOrder();

    await inMemoryOrdersRepository.create(newOrder1);
    await inMemoryOrdersRepository.create(newOrder2);
    await inMemoryOrdersRepository.create(newOrder3);

    const newDeliverymanId = new UniqueEntityID('deliveryman-01');
    const deliverymanId = newDeliverymanId.toString();

    newOrder1.status = Status.PICKN_UP;
    newOrder2.status = Status.PICKN_UP;

    newOrder1.deliverymanId = newDeliverymanId;
    newOrder2.deliverymanId = newDeliverymanId;
    newOrder3.deliverymanId = newDeliverymanId;

    await inMemoryOrdersRepository.save(newOrder1);
    await inMemoryOrdersRepository.save(newOrder2);
    await inMemoryOrdersRepository.save(newOrder3);

    const result = await sut.execute({
      deliverymanId,
      page: 1,
    });

    expect(result.value?.orders).toHaveLength(2);
  });

  it("should be able to fetch only orders with pick'n up status and from the same deliveryman", async () => {
    const newOrder1 = makeOrder();
    const newOrder2 = makeOrder();
    const newOrder3 = makeOrder();

    await inMemoryOrdersRepository.create(newOrder1);
    await inMemoryOrdersRepository.create(newOrder2);
    await inMemoryOrdersRepository.create(newOrder3);

    newOrder1.status = Status.PICKN_UP;
    newOrder2.status = Status.PICKN_UP;
    newOrder3.status = Status.DONE;

    newOrder1.deliverymanId = new UniqueEntityID('deliveryman-01');
    newOrder2.deliverymanId = new UniqueEntityID('deliveryman-02');
    newOrder3.deliverymanId = new UniqueEntityID('deliveryman-02');

    await inMemoryOrdersRepository.save(newOrder1);
    await inMemoryOrdersRepository.save(newOrder2);
    await inMemoryOrdersRepository.save(newOrder3);

    const result = await sut.execute({
      deliverymanId: 'deliveryman-01',
      page: 1,
    });

    expect(result.value?.orders).toHaveLength(1);
  });
});
