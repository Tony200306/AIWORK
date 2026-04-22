import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ClientService } from '../services/client.service';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
export class ClientController {
	private readonly logger = new Logger(ClientController.name);

	constructor(private readonly clientService: ClientService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new client' })
	async create(
		@Body() createClientDto: CreateClientDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const client = await this.clientService.create(user.id, createClientDto);

		return {
			success: true,
			message: 'Client created successfully',
			data: client,
		};
	}

	@Get()
	@ApiOperation({ summary: 'Get all clients for current user' })
	async findAll(@CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const clients = await this.clientService.findAll(user.id);

		return {
			success: true,
			data: clients,
		};
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a client by ID' })
	@ApiParam({ name: 'id', description: 'Client ID' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const client = await this.clientService.findOne(id, user.id);

		return {
			success: true,
			data: client,
		};
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a client' })
	@ApiParam({ name: 'id', description: 'Client ID' })
	async update(
		@Param('id') id: string,
		@Body() updateClientDto: UpdateClientDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const client = await this.clientService.update(id, user.id, updateClientDto);

		return {
			success: true,
			message: 'Client updated successfully',
			data: client,
		};
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a client' })
	@ApiParam({ name: 'id', description: 'Client ID' })
	async delete(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.clientService.delete(id, user.id);

		return {
			success: true,
			message: 'Client deleted successfully',
		};
	}
}
