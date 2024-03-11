import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';
import { ChangeOrderStatusEvent } from '../events/change-order-status-event';

export enum Status {
  WAITING = 'WAITING',
  PICKN_UP = 'PICKN_UP',
  DONE = 'DONE',
}

export enum Role {
  ADMIN = 'admin',
  DELIVERYMAN = 'deliveryman',
}

export interface OrderProps {
  recipientId: UniqueEntityID;
  city: string;
  neighborhood: string;
  role: Role;
  deliverymanId?: UniqueEntityID | null;
  title: string;
  status: Status;
  attachmentId: string;
  createdAt: Date;
  picknUpAt?: Date | null;
  deliveryAt?: Date | null;
  updatedAt?: Date | null;
}

export class Order extends AggregateRoot<OrderProps> {
  get recipientId() {
    return this.props.recipientId;
  }

  get city() {
    return this.props.city;
  }

  get neighborhood() {
    return this.props.neighborhood;
  }

  get role() {
    return this.props.role;
  }

  set role(role: Role) {
    if (Object.values(Role).includes(role)) {
      this.props.role = role;
    } else {
      console.error('Role invalid.');
    }
  }

  get deliverymanId() {
    return this.props.deliverymanId;
  }

  set deliverymanId(deliverymanId: UniqueEntityID | undefined | null) {
    this.props.deliverymanId = deliverymanId;
    this.touch();
  }

  get title() {
    return this.props.title;
  }

  set title(title: string) {
    this.props.title = title;
    this.touch();
  }

  get status() {
    return this.props.status;
  }

  set status(status: Status) {
    if (Object.values(Status).includes(status)) {
      this.addDomainEvent(new ChangeOrderStatusEvent(this, status));
      this.props.status = status;
      this.touch();

      if (status === Status.PICKN_UP) {
        this.picknUpTouch();
      }

      if (status === Status.DONE) {
        this.deliveryTouch();
      }
    } else {
      console.error('Status invalid.');
    }
  }

  get attachmentId() {
    return this.props.attachmentId;
  }

  set attachmentId(attachament: string) {
    this.props.attachmentId = attachament;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get picknUpAt() {
    return this.props.picknUpAt;
  }

  get deliveryAt() {
    return this.props.deliveryAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private picknUpTouch() {
    this.props.picknUpAt = new Date();
  }

  private deliveryTouch() {
    this.props.deliveryAt = new Date();
  }

  static create(
    props: Optional<OrderProps, 'status' | 'attachmentId' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const order = new Order(
      {
        ...props,
        status: props.status ?? Status.WAITING,
        attachmentId: props.attachmentId ?? '',
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return order;
  }
}
