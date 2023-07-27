import { Injectable } from '@nestjs/common';
import { CreatePokemonDTO } from './dto/create-pokemon';
import { TypeOrmMethods_Create } from '@app/libs/typeorm/create.orm';
import { InjectRepository } from '@nestjs/typeorm';
import { PokemonEntity } from './entities/pokemon.entity';
import { Repository } from 'typeorm';
import { ApiResponseMsg } from '@app/libs/errors/api-response-msg';
import { TypeOrmMethods_Find } from '@app/libs/typeorm/find.orm';
import { ServiceOptions } from '@app/libs/typeorm/serviceOptions.interfaces';
import { UpdatePokemonDTO } from './dto/update-pokemon';
import { PageOptionsDto } from '@app/libs/pagination/pageOption.dto';
import { FilterPokemonDto } from './dto/filter-pokemon.dto';
import { TypeOrmMethods_Delete } from '@app/libs/typeorm/delete.orm';

@Injectable()
export class PokemonService {
  _options: ServiceOptions = {
    repository: this.pokemonRepository,
    limit: 10,
    page: 1,
    orderKey: 'id',
    orderValue: 'desc',
    filter: {},
    withDeleted: false,
  };

  constructor(
    @InjectRepository(PokemonEntity)
    private pokemonRepository: Repository<PokemonEntity>,
  ) {}
  async create(createPokemonDto: CreatePokemonDTO) {
    const qBuilder = new TypeOrmMethods_Create(this.pokemonRepository);

    // call create structure
    const newRecord = await qBuilder.addNew(createPokemonDto, CreatePokemonDTO);

    const addedRecord = await this.findOne(newRecord['id']);

    // return success response
    return ApiResponseMsg.successResponse('saved successfully', addedRecord);
  }

  async findAll(options: PageOptionsDto, filter: any) {
    console.log(
      '@@@@@@@@@@@@@@@{typeof filter.generation}',
      typeof filter.generation,
    );
    Object.assign(this._options, options);
    const qBuilder = new TypeOrmMethods_Find(
      this.pokemonRepository,
      this._options,
    );
    const records = await qBuilder.FindAllPagination(filter);

    return ApiResponseMsg.successResponseWithPagination('succuss', records);
  }

  async findOne(id: number) {
    const qBuilder = new TypeOrmMethods_Find(
      this.pokemonRepository,
      this._options,
    );

    return qBuilder.FindOneBy({
      where: {
        id,
      },
    });
  }

  async getSingleRecord(id: number) {
    // check id is exist
    const pokemon = await this.findOne(id);
    if (!pokemon) {
      return ApiResponseMsg.notFoundResponse();
    }
    // return success response
    return ApiResponseMsg.successResponse(pokemon);
  }

  async update(id: number, updatePokemonDto: UpdatePokemonDTO) {
    // const pokemon = await this.pokemonRepository.findOne(id);
    // if (!pokemon) {
    //   throw new Error('Pokemon not found');
    // }
    // this.pokemonRepository.merge(pokemon, updatePokemonDto);
    // return this.pokemonRepository.save(pokemon);
  }

  async remove(id: number) {
    const qBuilder = new TypeOrmMethods_Delete(this.pokemonRepository);
    return await qBuilder.delete(id);
    // await this.pokemonRepository.delete(id);
  }
}
