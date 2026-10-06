import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { calcularPrioridad } from '../src/services/prioridad.js';
import { ValidationError } from '../src/errors/ValidationError.js';

const calcular = (calificacionCliente, tipoCliente, esUrgente = false) =>
  calcularPrioridad({ calificacionCliente, esUrgente, tipoCliente });

describe('calcularPrioridad', () => {
  describe('reglas', () => {
    it('ESTANDAR usa factor 1.0', () => {
      assert.deepEqual(calcular(4, 'ESTANDAR'), {
        prioridad: 4,
        factorAplicado: 1.0,
        tipoClienteNormalizado: 'ESTANDAR',
      });
    });

    it('VIP usa factor 1.5, también con calificación baja', () => {
      assert.equal(calcular(1, 'VIP').prioridad, 1.5);
    });

    it('VIP 5 + urgente → 9.5 (máximo alcanzable, el tope de 10 no se activa)', () => {
      assert.equal(calcular(5, 'VIP', true).prioridad, 9.5);
    });

    it('normaliza tipoCliente (" vip ")', () => {
      assert.equal(calcular(2, ' vip ').tipoClienteNormalizado, 'VIP');
    });
  });

  describe('regla faltante: CORPORATIVO con calificación < 3 no multiplica', () => {
    it('calificación 2 → 2, factor 1.0', () => {
      assert.deepEqual(calcular(2, 'CORPORATIVO'), {
        prioridad: 2,
        factorAplicado: 1.0,
        tipoClienteNormalizado: 'CORPORATIVO',
      });
    });

    it('calificación 2 + urgente → 4', () => {
      assert.equal(calcular(2, 'CORPORATIVO', true).prioridad, 4);
    });

    it('calificación 3 (límite) SÍ multiplica → 3.6 y no 3.5999999999999996', () => {
      assert.deepEqual(calcular(3, 'CORPORATIVO'), {
        prioridad: 3.6,
        factorAplicado: 1.2,
        tipoClienteNormalizado: 'CORPORATIVO',
      });
    });
  });

  describe('entradas inválidas', () => {
    for (const [nombre, valor] of [['NaN', NaN], ['"abc"', 'abc'], ['3.5', 3.5], ['6', 6]]) {
      it(`rechaza calificación ${nombre}`, () => {
        assert.throws(() => calcular(valor, 'VIP'), ValidationError);
      });
    }

    it('rechaza esUrgente "false" (string truthy)', () => {
      assert.throws(() => calcular(3, 'VIP', 'false'), ValidationError);
    });

    it('rechaza un tipoCliente desconocido', () => {
      assert.throws(() => calcular(3, 'PREMIUM'), ValidationError);
    });
  });
});
