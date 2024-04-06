import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';

import { EditOrderStatusToPicknUpUseCase } from '@/domain/delivery/application/use-cases/edit-order-status-to-pickn-up';

@ApiTags('orders')
@Controller('/orders/:orderId/picknup')
export class EditOrderStatusToPicknUpController {
  constructor(
    private editOrderStatusToPicknUp: EditOrderStatusToPicknUpUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('orderId') orderId: string,
  ) {
    const deliverymanId = user.sub;

    const result = await this.editOrderStatusToPicknUp.execute({
      deliverymanId,
      orderId,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
